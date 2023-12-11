export const PUBLIC_ROLES = {
    RIDER: 'rider',
    DRIVER: 'driver',
};

export const PRIVATE_ROLES = {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
    ACCOUNT_OFFICER: 'account-officer',
    SUPERVISOR: 'supervisor',
};

export const roles = Object.assign({}, PUBLIC_ROLES, PRIVATE_ROLES);
