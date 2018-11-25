// eslint-disable
// this is an auto generated file. This will be overwritten

export const getMapping = `query GetMapping($id: ID!) {
  getMapping(id: $id) {
    name
    author
    description
    mp3s
    locations
  }
}
`;
export const listMappings = `query ListMappings(
  $filter: ModelMappingFilterInput
  $limit: Int
  $nextToken: String
) {
  listMappings(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      name
      author
      description
      mp3s
      locations
    }
    nextToken
  }
}
`;
