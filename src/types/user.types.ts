export interface User {
     // ? User credentials
     email: string;
     password: string; //write only password while testing
     resetToken: string;

}

export interface ILoginResponse {
     token: string
}


export interface ResetTokenInfo {
     email: string;

}