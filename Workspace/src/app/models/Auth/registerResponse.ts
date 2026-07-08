export default interface RegisterResponse {
    message: string,
    email: string,
    accessToken: string,
    refreshToken: string,
    notificationsEnabled: boolean
}