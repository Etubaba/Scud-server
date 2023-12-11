import { PrismaClient, Prisma } from '@prisma/client';
import { permissions } from './../../modules/auth/permissions';
import { roles } from './../../modules/auth/roles';
import { settings } from './../../modules/settings/settings';
const prisma = new PrismaClient();

import { readFile } from 'node:fs/promises';

(async () => {
    console.info(`----Starting countries, states and cities---`);
    try {
        const data = await readFile(
            __dirname + '/countries+states+cities.json',
            'utf-8',
        );
        const json = JSON.parse(data);
        json.forEach(async (country) => {
            try {
                const countryModel = await prisma.country.upsert({
                    where: {
                        name: country.name,
                    },
                    update: {},
                    create: {
                        name: country.name,
                        iso3: country.iso3,
                        iso2: country.iso2,
                        numeric_code: country.numeric_code,
                        phone_code: country.phone_code,
                        capital: country.capital,
                        currency: country.currency,
                        currency_name: country.currency,
                        currency_symbol: country.currency_symbol,
                        region: country.region,
                        subregion: country.subregion,
                        timezones: country.timezones,
                        emoji: country.emoji,
                        latitude: country.latitude,
                        longitude: country.longitude,
                    },
                });

                country.states.forEach(async (state) => {
                    try {
                        const stateModel = await prisma.state.upsert({
                            where: {
                                name: state.name,
                            },
                            update: {},
                            create: {
                                name: state.name,
                                country_id: countryModel.id,
                                code: state.state_code,
                                latitude: state.latitude,
                                longitude: state.longitude,
                            },
                        });

                        state.cities.forEach(async (city) => {
                            try {
                                await prisma.city.upsert({
                                    where: {
                                        name: city.name,
                                    },
                                    update: {},
                                    create: {
                                        name: city.name,
                                        state_id: stateModel.id,
                                        latitude: city.latitude,
                                        longitude: city.longitude,
                                    },
                                });
                            } catch (error) {
                                if (
                                    error instanceof
                                    Prisma.PrismaClientKnownRequestError
                                ) {
                                    // The .code property can be accessed in a type-safe manner
                                    if (error.code === 'P2002') {
                                        console.log(
                                            `There is a unique constraint violation, a new city cannot be created with this name ${city.name}. No need to do anything just rerun the seeder`,
                                        );
                                    }
                                }
                            }
                        });
                    } catch (error) {
                        if (
                            error instanceof
                            Prisma.PrismaClientKnownRequestError
                        ) {
                            // The .code property can be accessed in a type-safe manner
                            if (error.code === 'P2002') {
                                console.log(
                                    `There is a unique constraint violation, a new state cannot be created with this name ${state.name}. No need to do anything just rerun the seeder`,
                                );
                            }
                        }
                    }
                });
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    // The .code property can be accessed in a type-safe manner
                    if (error.code === 'P2002') {
                        console.log(
                            `There is a unique constraint violation, a new country cannot be created with this name ${country.name}. No need to do anything just rerun the seeder`,
                        );
                    }
                }
            }
        });
    } catch (err) {
        console.error(err);
    }
    console.info(`----End countries, states and cities---`);

    console.info(`----Banks Started----`);
    try {
        const data = await readFile(__dirname + '/banks.json', 'utf-8');
        const banks = JSON.parse(data);
        banks.forEach(async (bank) => {
            // console.log(bank);

            // const country = await prisma.country.findFirst({
            //     where: {
            //         name: bank.country,
            //     },
            // });
            //console.log(country);

            await prisma.bank.upsert({
                where: {
                    name: bank.name,
                },
                create: {
                    code: bank.code,
                    name: bank.name,
                    country: {
                        connect: {
                            name: bank.country,
                        },
                    },
                },
                update: {
                    code: bank.code,
                    name: bank.name,
                    country: {
                        connect: {
                            name: bank.country,
                        },
                    },
                },
            });
        });
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                console.log(`There is a unique constraint violation`);
            }
        }
    }

    console.info(`----Banks Finished----`);
})()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

(async function () {
    console.info(`----Starting Settings---`);
    const data = Object.entries(settings).map((entry) => {
        const [key, value] = entry;
        return {
            key: key,
            value: <any>value,
        };
    });

    await prisma.setting.createMany({
        data,
        skipDuplicates: true,
    });
    console.info(`----End Settings---`);
})()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

(async () => {
    console.info(`----Starting Roles---`);
    const data = Object.values(roles).map((role) => {
        return {
            name: role,
        };
    });
    await prisma.role.createMany({
        data,
        skipDuplicates: true,
    });
    console.info(`----End Roles---`);
})()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

(async () => {
    console.info(`----Starting Permissions---`);
    const data = Object.entries(permissions).flatMap(
        ([entity, entityPermissions]) =>
            Object.values(entityPermissions).map((permissionName) => {
                return {
                    name: permissionName,
                };
            }),
    );

    await prisma.permission.createMany({
        data,
        skipDuplicates: true,
    });

    let perms = await prisma.permission.findMany({
        where: {
            roles: {
                every: {
                    role: {
                        name: {
                            not: roles.SUPER_ADMIN,
                        },
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (perms.length) {
        await Promise.all(
            perms.map((perm) => {
                return prisma.role
                    .upsert({
                        where: {
                            name: roles.SUPER_ADMIN,
                        },
                        update: {
                            permissions: {
                                create: perms.map((perm) => {
                                    return {
                                        permission: {
                                            connect: {
                                                id: perm.id,
                                            },
                                        },
                                    };
                                }),
                            },
                        },
                        create: {
                            name: roles.SUPER_ADMIN,
                        },
                    })
                    .catch((error) => {
                        if (
                            error instanceof
                            Prisma.PrismaClientKnownRequestError
                        ) {
                            if (error.code === 'P2002') {
                                console.log(
                                    `There is a unique constraint violation`,
                                );
                            }
                        }
                    });
            }),
        );
    }

    console.info(`----End Permissions---`);
})()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

(async () => {
    const [driverRole, accountOfficerRole, supervisorRole] = await Promise.all([
        prisma.role.upsert({
            where: {
                name: roles.DRIVER,
            },
            update: {},
            create: {
                name: roles.DRIVER,
            },
        }),
        prisma.role.findFirst({
            where: {
                name: roles.ACCOUNT_OFFICER,
            },
        }),
        prisma.role.findFirst({
            where: {
                name: roles.SUPERVISOR,
            },
        }),
    ]);

    const driverPermissions = Object.assign(
        {},
        {
            BANK_ACCOUNTS: permissions.BANK_ACCOUNTS,
            LICENSES: permissions.LICENSES,
            VEHICLES: permissions.VEHICLES,
            VEHICLE_BRAND: {
                BROWSE: permissions.VEHICLE_BRANDS.BROWSE,
                READ: permissions.VEHICLE_BRANDS.READ,
            },
            WITHDRAWAL_REQUESTS: {
                CREATE: permissions.WITHDRAWAL_REQUESTS.CREATE,
                BROWSE: permissions.WITHDRAWAL_REQUESTS.BROWSE,
            },
        },
    );

    console.info(`----Driver Permissions started----`);
    const driverQueries = [];
    Object.keys(driverPermissions).forEach((entity, index) => {
        Object.keys(driverPermissions[entity]).forEach((permission, index) => {
            const promise = prisma.permission
                .upsert({
                    where: {
                        name: driverPermissions[entity][permission],
                    },
                    update: {
                        name: driverPermissions[entity][permission],
                        roles: {
                            create: [
                                {
                                    role: {
                                        connect: {
                                            id: driverRole.id,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    create: {
                        name: driverPermissions[entity][permission],
                        roles: {
                            create: [
                                {
                                    role: {
                                        connect: {
                                            id: driverRole.id,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                })
                .catch((error) => {
                    if (error instanceof Prisma.PrismaClientKnownRequestError) {
                        if (error.code === 'P2002') {
                            console.log(
                                `There is a unique constraint violation`,
                            );
                        }
                    }
                });
            driverQueries.push(promise);
        });
    });

    Promise.all(driverQueries)
        .then(() => {
            console.log('All permissions were upserted successfully');
        })
        .catch((error) => {
            console.log(`Upserting permissions failed with error: ${error}`);
        });

    console.info(`----Driver Permissions done----`);

    const supervisorPermissions = Object.assign(
        {},
        {
            USERS: {
                BROWSE: permissions.USERS.BROWSE,
                READ: permissions.USERS.READ,
            },
        },
    );

    console.info(`----Supervisor Permissions started----`);
    const supervisorQueries = [];
    Object.keys(supervisorPermissions).forEach((entity, index) => {
        Object.keys(supervisorPermissions[entity]).forEach(
            (permission, index) => {
                const promise = prisma.permission
                    .upsert({
                        where: {
                            name: supervisorPermissions[entity][permission],
                        },
                        update: {
                            name: supervisorPermissions[entity][permission],
                            roles: {
                                create: [
                                    {
                                        role: {
                                            connect: {
                                                id: supervisorRole.id,
                                            },
                                        },
                                    },
                                    {
                                        role: {
                                            connect: {
                                                id: accountOfficerRole.id,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                        create: {
                            name: supervisorPermissions[entity][permission],
                            roles: {
                                create: [
                                    {
                                        role: {
                                            connect: {
                                                id: supervisorRole.id,
                                            },
                                        },
                                    },
                                    {
                                        role: {
                                            connect: {
                                                id: accountOfficerRole.id,
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    })
                    .catch((error) => {
                        if (
                            error instanceof
                            Prisma.PrismaClientKnownRequestError
                        ) {
                            if (error.code === 'P2002') {
                                console.log(
                                    `There is a unique constraint violation`,
                                );
                            }
                        }
                    });
                supervisorQueries.push(promise);
            },
        );
    });

    Promise.all(supervisorQueries)
        .then(() => {
            console.log('All permissions were upserted successfully');
        })
        .catch((error) => {
            console.log(`Upserting permissions failed with error: ${error}`);
        });

    console.info(`----Supervisor Permissions End----`);
})()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

(async () => {
    const [accountOfficerRole, adminRole] = await Promise.all([
        prisma.role.findFirst({
            where: {
                name: roles.ACCOUNT_OFFICER,
            },
        }),
        prisma.role.findFirst({
            where: {
                name: roles.SUPER_ADMIN,
            },
        }),
    ]);
    console.info(`----Starting admin user----`);
    const admins = [
        {
            first_name: 'Mudassir',
            last_name: 'Adili',
            email: 'mudassiradili4u@gmail.com',
            phone: '+2349033068587',
            is_active: true,
        },
        {
            first_name: 'Adebayo',
            last_name: 'Michael',
            email: 'mcgamma04@gmail.com',
            phone: '+2348038352700',
            is_active: true,
        },
        {
            first_name: 'Abaeze',
            last_name: 'Noble',
            email: 'onyiboixy@gmail.com',
            phone: '+2349163445438',
            is_active: true,
        },
    ];

    await Promise.all(
        admins.map(async (userData) => {
            return prisma.user
                .upsert({
                    where: {
                        phone: userData.phone,
                    },
                    update: {},
                    create: {
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        email: userData.email,
                        phone: userData.phone,
                        provider: 'phone',
                        is_active: userData.is_active,
                        phone_verified: true,
                        email_verified: true,
                        roles: {
                            create: [
                                {
                                    role: {
                                        connect: {
                                            id: adminRole.id,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                })
                .catch((error) => {
                    if (error instanceof Prisma.PrismaClientKnownRequestError) {
                        if (error.code === 'P2002') {
                            console.log(
                                `There is a unique constraint violation`,
                            );
                        }
                    }
                });
        }),
    );

    console.info(`----Account officer started----`);

    const account_officer = [
        {
            first_name: 'Scud',
            last_name: 'Officer',
            email: 'nigeria@scud.io',
            phone: '+2348061970952',
            is_active: true,
        },
    ];

    await Promise.all(
        account_officer.map((userData) => {
            return prisma.user.upsert({
                where: {
                    email: userData.email,
                },
                update: {},
                create: {
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                    phone: userData.phone,
                    provider: 'phone',
                    is_active: userData.is_active,
                    phone_verified: true,
                    email_verified: true,
                    roles: {
                        create: [
                            {
                                role: {
                                    connect: {
                                        id: accountOfficerRole.id,
                                    },
                                },
                            },
                        ],
                    },
                },
            });
        }),
    );

    console.info(`----Account officer done----`);
})()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
