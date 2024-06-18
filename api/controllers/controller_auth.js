// --------------------------------------CONTROLLER_CONFIG
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const bcryptjs = require('bcryptjs');
const JWT = require('jsonwebtoken');
const { jwt_config } = require('../services/jwt_config.js');
const { User, TokenBlacklist, UserRole } = require('../models/db_orm.js');
const { Op } = require('sequelize');

// --------------------------------------CONTROLLER
class AuthController {
	async signup(req, res) {
		// #swagger.tags = ['Reg&Auth']
		// #swagger.summary = 'Sign up end-point.'
		/* 
			#swagger.description = 'This is the end-point for the registration of new users in the system. Both users and admins can use it.'
		*/
		// #swagger.operationId = 'signup'
		/*
			#swagger.requestBody = {
				required: true,
				content: {
					'multipart/form-data': {
						schema: {
							$ref: '#/components/schemas/SignUp_schema'
						}
					}
				}
			}
		*/
		/*
			#swagger.responses[201] = {
				description: 'Created',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['message'],
							properties: {
								message: {
									type: 'string',
									format: 'string',
									examples: 'User signed up successfully!',
									description: 'Message of the successful signup of the user response',
								}
							}
						}
					}
				}
			}
			#swagger.responses[400] = {
				description: 'Bad request',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['message'],
							properties: {
								message: {
									type: 'string',
									format: 'string',
									examples: 'Invalid role. Should be "user" or "admin".',
									description: 'Error message of the bad request response',
								}
							}
						}
					}
				}
			}
			#swagger.responses[413] = {
				description: 'Payload too large',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error413_schema'
						}
					}
				}
			}
			#swagger.responses[415] = {
				description: 'Unsupported media type',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error415_schema'
						}
					}
				}
			}
			#swagger.responses[422] = {
				description: 'Unprocessable entity',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error422_schema'
						}
					}
				}
			}
			#swagger.responses[500] = {
				description: 'Internal server error',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error500_schema'
						}
					}
				}
			}
		*/
		try {
			if (req.avatar_formatError) {
				throw new Error(req.avatar_formatError);
			}
			if (req.files[0] && req.files[0].size > 10_000_000) {
				throw new Error('File size is too big. Should be less than 10 MB.');
			}
			const role = req.body.role ? req.body.role : 'user';
			if (role !== 'user' && role !== 'admin') {
				throw new Error('Invalid role. Should be "user" or "admin".');
			}
			await UserRole.findOne({ where: { role: role } }).then((result) => {
				result
					.createUser({
						username: req.body.username,
						email: req.body.email,
						first_name: req.body.first_name ? req.body.first_name : null,
						last_name: req.body.last_name ? req.body.last_name : null,
						avatar: req.files[0] ? req.files[0].path : null,
						password: bcryptjs.hashSync(req.body.password, 10),
						user_role_id: result.id,
					})
					.then(() => {
						res.status(201);
						res.json({
							message: `User: ${req.body.username} was created successfully!`,
						});
						res.end();
						return;
					});
			});
		} catch (error) {
			// If there is a file uploaded in the request, delete it first (unlink it from the file system).
			req.files[0] ? fs.unlinkSync(req.files[0].path) : null;
			if (error.message === req.avatar_formatError) {
				res.status(415);
				res.json({
					message: error.message,
				});
				res.end();
				return;
			} else if (error.message === 'File size is too big. Should be less than 10 MB.') {
				res.status(413);
				res.json({
					message: error.message,
				});
				res.end();
				return;
			} else if (error.message === 'Invalid role. Should be "user" or "admin".') {
				res.status(400);
				res.json({
					message: error.message,
				});
				res.end();
				return;
			}

			res.status(500);
			res.json({
				message: error.message,
			});
			res.end();
			return;
		}
	}

	async signin(req, res) {
		// #swagger.tags = ['Reg&Auth']
		// #swagger.summary = 'Sign in end-point.'
		/* 
			#swagger.description = 'This is the end-point for the signing in of registered users in the system.'
		*/
		// #swagger.operationId = 'signin'
		/*
		   #swagger.requestBody = {
			   required: true,
			   content: {
				   'application/json': {
					   schema: {
						oneOf: [
							{
								$ref: '#/components/schemas/SignInWithEmail_schema'
							},
							{
								$ref: '#/components/schemas/SignInWithUsername_schema'
							}
						]
					   	}
					}
				}
		   }
		*/
		/*
		#swagger.responses[200] = {
				description: 'OK',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['message', 'token_access', 'token_refresh'],
							properties: {
								message: {
									type: 'string',
									format: 'string',
									example: 'User signed in successfully!',
									description: 'Message of the successful sign in response',
								},
								token_access: {
									type: 'string',
									format: 'string',
									example: 'eyJhbGciOiJIUzI1NiIsInR...',
									description: 'Access token for the signed in user',
								},
								token_refresh: {
									type: 'string',
									format: 'string',
									example: 'eyJhbGciOjJIUzI1NiIsInR...',
									description: 'Refresh token for the signed in user',
								}
							}
						}
					}
				}
			}
			#swagger.responses[401] = {
				description: 'Unauthorized',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error401_schema'
						}
					}
				}
			}
			#swagger.responses[422] = {
				description: 'Unprocessable Entity',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error422_schema'
						}
					}
				}
			}
			#swagger.responses[500] = {
				description: 'Internal server error',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error500_schema'
						}
					}
				}
			}
		 */
		try {
			const email = req.body.email ? req.body.email : null;
			const username = req.body.username ? req.body.username : null;
			const password = req.body.password;
			if (!email && !username) {
				throw new Error('Email or username are required.');
			}
			const isRegisteredUser = await User.findOne({
				where: { [Op.or]: [{ email: email }, { username: username }] },
			});
			if (!isRegisteredUser) {
				throw new Error('User is not registered.');
			}
			const isPasswordCorrect = bcryptjs.compareSync(password, isRegisteredUser.password);
			if (!isPasswordCorrect) {
				throw new Error('Wrong password.');
			}
			const token_access = JWT.sign(
				{ username: isRegisteredUser.username, email: isRegisteredUser.email, role: isRegisteredUser.user_role_id },
				jwt_config.jwt_secretKey,
				{
					expiresIn: jwt_config.jwt_expiresInAccess,
				}
			);
			// Generate a refresh token and check if the token is already blacklisted.
			while (true) {
				const token_refresh = JWT.sign(
					{ username: isRegisteredUser.username, email: isRegisteredUser.email, role: isRegisteredUser.user_role_id },
					jwt_config.jwt_secretKey,
					{ expiresIn: jwt_config.jwt_expiresInRefresh }
				);
				const isRefreshTokenBlacklisted = await TokenBlacklist.findOne({ where: { jwt_token: token_refresh } });
				// If the token is not blacklisted, send the response with both access and refresh tokens.
				if (!isRefreshTokenBlacklisted) {
					res.status(200);
					res.json({
						message: `User: ${isRegisteredUser.username} signed in successfully!`,
						token_access: token_access,
						token_refresh: token_refresh,
					});
					res.end();
					return;
				} else {
					// If the token is blacklisted, generate a new one and check again.
					continue;
				}
			}
		} catch (error) {
			if (
				error.message === 'User is not registered.' ||
				error.message === 'Wrong password.' ||
				error.message === 'Email or username are required.'
			) {
				res.status(401);
				res.json({
					message: error.message,
				});
				res.end();
				return;
			}

			res.status(500);
			res.json({
				message: error.message,
			});
			res.end();
			return;
		}
	}

	async signout(req, res) {
		// #swagger.tags = ['Reg&Auth']
		// #swagger.summary = 'Sign out end-point.'
		/* 
			#swagger.description = 'This is the end-point for the signing out of registered users in the system and blacklisting their refresh tokens permanently.'
		*/
		// #swagger.operationId = 'signout'
		// #swagger.security = [{"bearerAuth": []}]
		/*
			#swagger.responses[200] = {
				description: 'OK',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['message'],
							properties: {
								message: {
									type: 'string',
									format: 'string',
									example: 'User signed out successfully!',
									description: 'Message of the successful sign out response',
								}
							}
						}
					}
				}
			}

			#swagger.responses[401] = {
				description: 'Unauthorized',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error401_schema',
							},
						},
					}
				}

			#swagger.responses[422] = {
				description: 'Unprocessable Entity',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error422_schema',
							},
						},
					}
				}

			#swagger.responses[500] = {
				description: 'Internal server error',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error500_schema',
							},
						},
					}
				}
		*/
		try {
			const refresh_token = req.headers.authorization.split(' ')[1];
			const isBlacklisted = await TokenBlacklist.findOne({ where: { jwt_token: refresh_token } });
			if (isBlacklisted) {
				throw new Error('User is already signed out.');
			}
			await TokenBlacklist.create({ jwt_token: refresh_token }).then(() => {
				res.status(200);
				res.json({
					message: 'User signed out successfully!',
				});
				res.end();
				return;
			});
		} catch (error) {
			if (error.message === 'User is already signed out.') {
				res.status(401);
				res.json({
					message: error.message,
				});
				res.end();
				return;
			}
			res.status(500);
			res.json({
				message: error.message,
			});
			res.end();
			return;
		}
	}

	async refresh(req, res) {
		// #swagger.tags = ['Reg&Auth']
		// #swagger.summary = 'Refresh of the access token end-point.'
		/* 
			#swagger.description = 'This is the end-point for the refreshing of the access token of registered users in the system.'
		*/
		// #swagger.operationId = 'refresh'
		// #swagger.security = [{"bearerAuth": []}]
		/* 
			#swagger.responses[200] = {
		 	description: 'OK',
			content: {
				'application/json': {
					schema: {
						'type': 'object',
						'required': ['message','token_access',],
						'properties': {
							'message': {
								'type': 'string',
								'format': 'string',
								'example': 'Access token has been successfully refresh!',
								'description': 'Message of the successful refresh of the access token response',
							},
							'token_access': {
								'type': 'string',
								'format': 'string',
								'example': 'eyJhbGciOiJIUzI1NiIsInR...',
								'description': 'Access token of the user',
		 					},
		 				},
		 			},		
		 		},
			}
		}
		 	#swagger.responses[401] = {
		 	description: 'Unauthorized',
		 	content: {
		 		'application/json': {
		 			schema: {
		 				$ref: '#/components/schemas/Error401_schema',
		 			},
		 		},
		 	},
		 }
		 	#swagger.responses[422] = {
		 	description: 'Unprocessable Entity',
		 	content: {
		 		'application/json': {
		 			schema: {
		 				$ref: '#/components/schemas/Error422_schema',
		 			},
		 		},
		 	},
		 }
			#swagger.responses[500] = {
		 	description: 'Internal server error',
		 	content: {
		 		'application/json': {
		 			schema: {
		 				$ref: '#/components/schemas/Error500_schema',
		 			},
		 		},
		 	},
		 }
		*/
		try {
			const refresh_token = req.headers.authorization.split(' ')[1];
			await TokenBlacklist.findOne({ where: { jwt_token: refresh_token } }).then((result) => {
				if (result) {
					throw new Error('Invalid refresh token. User is not signed in.');
				}
				const token_access = JWT.sign(
					{ username: JWT.decode(refresh_token).username, email: JWT.decode(refresh_token).email, role: JWT.decode(refresh_token).role },
					jwt_config.jwt_secretKey,
					{
						expiresIn: jwt_config.jwt_expiresInAccess,
					}
				);
				res.status(200);
				res.json({
					message: 'Access token refreshed successfully!',
					token_access: token_access,
				});
				res.end();
				return;
			});
		} catch (error) {
			if (error.message === 'Invalid refresh token. User is not signed in.') {
				res.status(401);
				res.json({
					message: error.message,
				});
				res.end();
				return;
			}
			res.status(500);
			res.json({
				message: error.message,
			});
			res.end();
			return;
		}
	}

	async profile(req, res) {
		// #swagger.tags = ['Reg&Auth'];
		// #swagger.summary = 'User profile end-point.';
		// #swagger.description = 'This is the end-point for the user profile of registered users in the system.';
		// #swagger.operationId = 'profile';
		// #swagger.security = [{ bearerAuth: [] }];
		/* #swagger.responses[200] = {
			description: 'OK',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/UserProfile_schema',
						},
					},
				}
			}
			#swagger.responses[422] = {
			description: 'Unprocessable Entity',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Error422_schema',
						},
					},
				}
			}
			#swagger.responses[500] = {
			description: 'Internal server error',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Error500_schema',
						},
					},
				}
			}
		*/

		try {
			const token = req.headers.authorization.split(' ')[1];
			const username = JWT.decode(token).username;
			const email = JWT.decode(token).email;
			await User.findAll({
				where: {
					[Op.and]: [{ username: username }, { email: email }],
				},
				include: [
					{
						model: UserRole,
						required: true,
					},
				],
			}).then((user) => {
				res.status(200);
				res.json({
					username: user[0].username,
					email: user[0].email,
					first_name: user[0].first_name,
					last_name: user[0].last_name,
					avatar: user[0].avatar,
					created_at: user[0].created_at,
					role: user[0].user_role.role,
				});
				res.end();
				return;
			});
		} catch (error) {
			res.status(500);
			res.json({
				message: error.message,
			});
			res.end();
			return;
		}
	}
}

// --------------------------------------EXPORT
module.exports = new AuthController();
