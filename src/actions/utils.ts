import Error from "../models/error"

class Utils {
  async get(uri: string) {
    const response = await fetch(uri, {
    })
    if (!response.ok) {
      throw await response.json()
    }
    return response
  }

  async post(uri: string, body: object) {
    const response = await fetch(uri, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      let json: Error
      try {
        json = await response.json()
      } catch {
        json = { error: true, reason: "Connection Error", message: `${response.statusText} (${response.status})` }
      }
      throw json

    }
    return response
  }

  async put(uri: string, body: object) {
    const response = await fetch(uri, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw await response.json()
    }
    return response
  }

  async delete(uri: string) {
    return await fetch(uri, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    })
  }
}

export default new Utils()
