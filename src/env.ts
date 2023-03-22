import { envsafe, port, str } from 'envsafe';

export const env = envsafe({
  REDISHOST: str({devDefault: 'localhost'}),
  REDISPORT: port({devDefault: 6379}),
  REDISUSER: str({devDefault: '', allowEmpty: true}),
  REDISPASSWORD: str({devDefault: '', allowEmpty: true}),
  PORT: port({
    devDefault: 3000,
  }),
  RAILWAY_STATIC_URL: str({
    devDefault: 'http://localhost:3000',
  }),
});
