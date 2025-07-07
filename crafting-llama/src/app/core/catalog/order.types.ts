export enum OrderStatus {
    New = 'new',
    Active = 'active',
    Completed = 'completed',
}

export interface Order {
    id: string;
    customerEmail: string;
    createdAt: string;
    updatedAt: string;
    status: OrderStatus;
    notesCount: number;
}

export interface OrderNote {
    id: string;
    orderId: string;
    text: string;
    createdAt: string;
}
