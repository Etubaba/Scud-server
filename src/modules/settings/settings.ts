export const settings = {
    // IN APP FUNCTIONS
    INACTIVE_USER_WAIT: '2', // in weeks
    PAGE_SIZE: '100',
    DEFAULT_DRIVERS_MAX_PICKUP_DISTANCE: '6', // in Kilometer
    DEFAULT_DRIVERS_CREDIBILITY_SCORE: '100', // Percentage,
    DEFAULT_NIGHT_START_TIME: '7:00pm',
    DEFAULT_NIGHT_END_TIME: '6:00am',
    OTP_DELAY_TIME: '5', //in minutes
    FIRST_OWE_MAIL_SUBJECT: 'Please Pay',
    FIRST_OWE_MAIL_BODY: '{"rawstring":"you are owing"}',
    SECOND_OWE_MAIL_SUBJECT: 'Please Pay up ',
    SECOND_OWE_MAIL_BODY: '{"rawstring":"you are owing"}',
    LAST_OWE_MAIL_SUBJECT: 'Please Pay',
    LAST_OWE_MAIL_BODY: '{"rawstring":"you are owing"}',
    // IN APP FUNCTIONS END

    // SOCIAL
    APPLE_STORE_DRIVER_LINK: '',
    PLAY_STORE_DRIVER_LINK: '',
    APPLE_STORE_RIDER_LINK: '',
    PLAY_STORE_RIDER_LINK: '',
    FACEBOOK_LINK: '',
    LINKEDIN_LINK: '',
    INSTAGRAM_LINK: '',
    YOUTUBE_LINK: '',
    PINTEREST_LINK: '',
    SUPPORT_EMAIL: 'ikedinobicruz7@gmail.com',
    // SOCIAL END

    // IN-APP FINANCES 
    DRIVER_SERVICE_FARE: '40',
    MINIMUM_WITHDRAWAL_AMOUNT: '1000',
    MAXIMUM_WITHDRAWAL_AMOUNT: '100000',
    MINIMUM_OWED_AMOUNT: '2000',
    MAXIMUM_OWED_AMOUNT: '10000',
    MINIMUM_REFERRAL_AMOUNT: '20000',
    PERCENTAGE_FOR_SECOND_OWE_MAIL: '50',
    // IN-APP FINANCES END

    // PAYMENT
    ACTIVE_PAYMENT_GATEWAY: 'PAYSTACK',
    PAYSTACK_SECRET_KEY: 'sk_test_b3e352d5cbd97d5bc03e0ed761660449ed250114',
    PAYSTACK_PUBLIC_KEY: 'pk_test_3ffbb77766e0aa9e09e5fd6be7c4aece0a5fc7bb',
    FLUTTERWAVE_SECRET_KEY: 'FLWSECK_TEST-29732a3aa397c0fa62ed605110cd19bb-X',
    FLUTTERWAVE_PUBLIC_KEY: 'FLWPUBK_TEST-6598d20995477258d0e838f0435230a8-X',
    STRIPE_SECRET_KEY: 'rkrdke',
    STRIPE_PUBLIC_KEY: 'skskssiwossksmsmsmsm',
    // PAYMENT END
};

export type settingsKey = keyof typeof settings;
