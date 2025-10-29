export class User {
    public readonly id: string;
    public name: string;
    public email: string;
    public readonly createdAt: Date;
    public updatedAt: Date;

    constructor(id: string, name: string, email: string, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    isEmailValid(): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    }
}