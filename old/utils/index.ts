export const parseJSON = (json) => {
  try {
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}
