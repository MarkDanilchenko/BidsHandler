// --------------------------------------APP_CONFIG
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const { server } = require('./server.js');
const host_server = process.env.SERVER_HOST || '127.0.0.1';
const port_server = 3000;
const { sequelize } = require('./models/db_orm.js');

// --------------------------------------START SERVER+DB
(async () => {
	try {
		await sequelize
			.sync({ force: true })
			.then(() => {
				console.log(`PostgresQL connected!`);
				server.listen(port_server, host_server, () => {
					if (process.env.SERVER_PORT_OUTER) {
						console.log(`Server started on host:port - ${host_server}:${process.env.SERVER_PORT_OUTER}`);
					} else {
						console.log(`Server started on host:port - ${host_server}:${port_server}`);
					}
				});
			})
			.catch((error) => {
				console.log(error);
                sequelize.close();
                process.exit(0);
			});
	} catch (error) {
		console.log(error);
        await sequelize.close();
        process.exit(0);
	}
})();

// --------------------------------------EXIT SERVER+DB
process.on('SIGINT', async () => {
	await sequelize.close();
	console.log(`PostgresQL disconnected!`);
	process.exit(0);
});
