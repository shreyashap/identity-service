import express from 'express';
import { envData } from './config/dotenv.js';

import identifyRoutes from './routes/identify.route.js';

const app = express();
const PORT = envData.PORT;

app.use(express.json());

app.use('/', identifyRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
