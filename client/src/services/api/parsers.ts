export function createUserFromAPI(userAPI: any) {
  return { id: userAPI.id, name: userAPI.name, createdAt: new Date(userAPI.created_at) };
}
