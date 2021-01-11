export interface User {
     email: string;
     password: string;
     resetToken: string;

}

export interface ILoginResponse {
     token: string
}

export interface ResetTokenInfo {
     email: string;
}