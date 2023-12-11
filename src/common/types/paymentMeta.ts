type ReasonFor = 'ride-payment' | 'withdrawal';

export type paymentMeta = {
    for?: ReasonFor;
    id?: string | number;
    trip_id?: number;
};
