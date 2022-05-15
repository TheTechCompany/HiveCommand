export const log = (user: string, message: string) => {
    console.log(`User: ${user} - ${message} @ ${new Date().toISOString()}`)
}