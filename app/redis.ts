import { createClient } from 'redis';

export default createClient({
  socket: { host: 'redis' },
  password: 'secret',
});
