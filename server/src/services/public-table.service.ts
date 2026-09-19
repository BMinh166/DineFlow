import { Table } from '../models/table.js'
import { NotFound } from '../utils/app-error.js'

export interface PublicTableDto {
  id: string
  number: number
}

type PublicTableForDto = {
  _id: { toString(): string }
  number: number
  active: boolean
}

function toPublicTableDto(table: PublicTableForDto): PublicTableDto {
  return {
    id: table._id.toString(),
    number: table.number,
  }
}

export async function getPublicTable(tableId: string): Promise<PublicTableDto> {
  const table = await Table.findById(tableId).select('_id number active')

  if (!table) {
    throw new NotFound('Table not found.', 'TABLE_NOT_FOUND')
  }

  if (!table.active) {
    throw new NotFound('Table is inactive.', 'TABLE_INACTIVE')
  }

  return toPublicTableDto(table)
}
