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
    imageUrl?: string | null;
}

export interface HydratedOrderEntry {
    id: string;
    quantity: number;
    values: Record<string, string>;
    design: {
        id: string;
        name: string;
        description: string;
        price_from: number;
        hero_image: string;
        tags: string[];
    };
    variant: {
        id: string;
        name: string;
        price: number;
        hero_image: string;
        description: string;
    } | null;
}
