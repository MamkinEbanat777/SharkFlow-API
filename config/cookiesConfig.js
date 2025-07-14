export const GUEST_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? process.env.GUEST_COOKIE_NAME
    : 'log___sf_21s_t1';

export const REFRESH_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? process.env.REGISTER_COOKIE_NAME
    : 'log___tf_12f_t2';

export const REGISTER_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? process.env.REGISTER_COOKIE_NAME
    : 'sd_f93j8f___';
