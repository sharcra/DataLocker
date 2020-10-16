import getByUserId from './getByUserId'
import { getPathParameter, getUserId } from '@/utils/api-gateway'
import {
  getDocumentsByOwnerId,
  Document as DocumentModel,
} from '@/models/document'
import {
  createMockContext,
  createMockEvent,
  toMockedFunction,
} from '@/utils/test'

jest.mock('@/utils/database', () => {
  return {
    connectDatabase: jest.fn(),
  }
})

jest.mock('@/utils/api-gateway', () => {
  const module = jest.requireActual('@/utils/api-gateway')
  return {
    ...module,
    getPathParameter: jest.fn(),
    getUserId: jest.fn(),
  }
})

jest.mock('@/models/document', () => {
  const module = jest.requireActual('@/models/document')
  return {
    ...module,
    getDocumentsByOwnerId: jest.fn(),
  }
})

describe('getByUserId', () => {
  const userId = 'myUserId'

  beforeEach(() => {
    toMockedFunction(getPathParameter).mockImplementationOnce(() => userId)
    toMockedFunction(getUserId).mockImplementationOnce(() => userId)
  })

  it('returns document', async () => {
    toMockedFunction(getDocumentsByOwnerId).mockImplementationOnce(() =>
      Promise.resolve([
        DocumentModel.fromJson({
          id: 'myDocumentId1',
          ownerId: userId,
          name: 'My First File',
          createdAt: new Date('2015-01-12T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
        DocumentModel.fromJson({
          id: 'myDocumentId2',
          ownerId: userId,
          name: 'My Second File',
          createdAt: new Date('2015-01-27T13:14:15Z'),
          createdBy: userId,
          updatedBy: userId,
        }),
      ]),
    )
    expect(await getByUserId(createMockEvent(), createMockContext(), jest.fn()))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[{\\"name\\":\\"My First File\\",\\"createdDate\\":\\"2015-01-12T13:14:15.000Z\\",\\"id\\":\\"myDocumentId1\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId1\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]},{\\"name\\":\\"My Second File\\",\\"createdDate\\":\\"2015-01-27T13:14:15.000Z\\",\\"id\\":\\"myDocumentId2\\",\\"links\\":[{\\"href\\":\\"/documents/myDocumentId2\\",\\"rel\\":\\"self\\",\\"type\\":\\"GET\\"}]}]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
  it('returns empty when none found', async () => {
    toMockedFunction(getDocumentsByOwnerId).mockImplementationOnce(() =>
      Promise.resolve([]),
    )
    expect(await getByUserId(createMockEvent(), createMockContext(), jest.fn()))
      .toMatchInlineSnapshot(`
      Object {
        "body": "{\\"documents\\":[]}",
        "cookies": Array [],
        "headers": Object {
          "Content-Type": "application/json",
        },
        "isBase64Encoded": false,
        "statusCode": 200,
      }
    `)
  })
})
