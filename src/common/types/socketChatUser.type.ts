export type ChatUser = {
    id: number;
    socket_id: string;
};

export type ChatMessage = {
    recipient_id: number;
    content: string;
};
