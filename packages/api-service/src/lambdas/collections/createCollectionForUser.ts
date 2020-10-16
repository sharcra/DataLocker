import {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda'
import {
  Collection as CollectionContract,
  CollectionCreate as CollectionCreateContract,
  CollectionGrantType,
} from 'api-client'
import {
  createErrorResponse,
  createJsonResponse,
  getPathParameter,
  getUserId,
} from '@/utils/api-gateway'
import { connectDatabase } from '@/utils/database'
import { createCollectionSchema } from './validation'
import { v4 as uuidv4 } from 'uuid'
import { createCollection, CreateCollectionInput } from '@/models/collection'
import { allDocumentsExistById } from '@/models/document'
import { AgencyGrantTypes, allAgencyGrantsExists } from '@/models/agencyGrant'

connectDatabase()

export const handler: APIGatewayProxyHandlerV2<APIGatewayProxyResultV2<
  CollectionContract
>> = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<CollectionContract>> => {
  const ownerId = getPathParameter(event, 'userId')
  const userId = getUserId(event)
  if (!ownerId) {
    return createErrorResponse('userId path parameter not found')
  }
  if (ownerId != userId) {
    return createErrorResponse('userId not found')
  }
  if (!event.body) {
    return createErrorResponse('body not supplied')
  }
  const { error, value } = createCollectionSchema.validate(
    JSON.parse(event.body),
  )
  if (error) {
    return createErrorResponse(
      `validation error: ${error.details.map((x) => x.message).join(', ')}`,
    )
  }

  // prepare values
  const createdAt = new Date()
  const updatedAt = createdAt
  const createdBy = userId
  const updatedBy = userId
  const {
    name,
    documentIds,
    agencyOfficersEmailAddresses,
  } = value as CollectionCreateContract

  // extended validation - check documents exist for user
  const allDocumentsBelongToUser = await allDocumentsExistById(
    documentIds,
    ownerId,
  )
  if (!allDocumentsBelongToUser) {
    return createErrorResponse(`validation error: documents not found`)
  }

  // extended validation - check documents exist for user
  const agencyDomainGrants = [
    ...new Set(agencyOfficersEmailAddresses.map((e) => e.split('@')[1])),
  ].map((domain) => ({
    requirementType: AgencyGrantTypes.DOMAIN,
    requirementValue: domain,
  }))
  const allAgencyGrantsExist = await allAgencyGrantsExists(agencyDomainGrants)
  if (!allAgencyGrantsExist) {
    return createErrorResponse(`validation error: agency emails not found`)
  }

  // create model input
  const collection: CreateCollectionInput = {
    name: name,
    id: uuidv4(),
    ownerId,
    createdBy,
    createdAt,
    updatedAt,
    updatedBy,
    collectionDocuments: documentIds.map((documentId) => ({
      documentId,
      createdBy,
      createdAt,
    })),
    grants: agencyOfficersEmailAddresses.map((email) => ({
      requirementType: CollectionGrantType.AGENCYOFFICEREMAIL,
      requirementValue: email,
      createdBy,
      createdAt,
    })),
  }

  // submit model
  const createdCollection = await createCollection(collection)
  if (!createdCollection) {
    return createErrorResponse('collection could not be created')
  }

  // return response
  const { id, name: createdName, createdAt: createdDate } = createdCollection
  return createJsonResponse<CollectionContract>({
    createdDate: createdDate.toISOString(),
    id,
    name: createdName,
    links: [
      {
        href: '/collections/{collectionId}/grants',
        rel: 'grants',
        type: 'GET',
      },
      {
        href: '/collections/{collectionId}/documents',
        rel: 'documents',
        type: 'GET',
      },
    ],
  })
}

export default handler
