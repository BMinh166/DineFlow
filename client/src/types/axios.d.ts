import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthInvalidation?: boolean
  }
}
