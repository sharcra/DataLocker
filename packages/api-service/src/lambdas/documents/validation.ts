import Joi from 'joi'
import { MaxFileSize, MaxFilesPerDocument } from '@/constants'

export const createFileSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  contentLength: Joi.number().min(1).max(MaxFileSize).required(),
  contentType: Joi.string()
    .allow('application/pdf', 'image/jpeg', 'image/png', 'image/tiff')
    .only()
    .required(),
  sha256Checksum: Joi.string().min(1).max(255).required(),
})

export const createDocumentSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  files: Joi.array()
    .items(createFileSchema)
    .min(1)
    .max(MaxFilesPerDocument)
    .required(),
})
