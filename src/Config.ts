export default {
    backendBaseUri: process.env.REACT_APP_BACKEND_BASE_URI ?? '',
    debugMode: (process.env.REACT_APP_BACKEND_BASE_URI ?? 'false') === 'true' ? true : false,
}