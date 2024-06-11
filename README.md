## App Description &#128196;

#### <div style="text-align: end;">This is simple API based on NodeJS (ExpressJS) that provides service to handle requests from users of the website. Users could send their requests and administration of the website could handle these requests anyhow, also with users' email based responses.</div>

## Launch instructions &#128196;

Technologies used:

- **Backend**:
  - NodeJS (ExpressJS);
  - PostgresQL (Sequelize);
  - Insomnia <span style="font-size: smaller">(for testing and documenting API);</span>
  - OpenAPI (swagger) <span style="font-size: smaller">(for documenting API);</span>
  - Docker + Compose.

---
<br>

1. Clone repository/archive to your **local folder**;
2. Open Terminal and make sure You are in **local folder**:

    ```
    cd '.../local_folder'
    ```

3. Copy file dev.env and rename to .env in the same root directory:

    ```
    cp dev.env .env
    ```

4. Open and follow the instructions in the new created .env file;

5. For this step you should already have installed Docker and Compose on your PC. Start installation:

    ```
    docker compose up --build
    ```

- Installation can take some time, it depends on your PC resources;
- After the installation is completed, the app will start automatically on host:port = 0.0.0.0:3001 *(host:port by default)*;
- Open app using <http://0.0.0.0:3001> in your browser;

6. To stop the server:

    ```
    Ctrl + C
    ```

7. To **stop app** (stop all docker containers):

    ```
    docker compose stop
    ```

8. To **start app** (start all docker containers):

    ```
    docker compose start
    ```

9. To completely **remove** all created docker containers, images and volumes:

   ```
   docker compose down --volumes --rmi all
   ```

## API Endpoints &#128196;

1. **Test URL**:

    <span style="font-size: smaller">request:</span> ->

    ```
    http://0.0.0.0:3000/
    ```

    <span style="font-size: smaller">response (json):</span> ->

    <div align="center">
    <img src="./screenshots/ScrShot_1.png" width="75%" height="75%" alt='Greeting page of the API.'>
    </div>

2. **API URLs**

    2.1. **Insomnia API documentation**

    > For browsing Insomnia API documentation change directory to the /api_documentation/insomnia and run insomnia client server:

    ```
    cd api_documentation/insomnia && npx serve
    ```

    p.s.: <span style="font-size: 12px">*press **Y** if any packages are required.*</span>

    2.2. **OpenAPI3 documentation**:

    > OpenAPI (Swagger) documentation are also available in .yaml format in api_documentation/openapi.

<br>

---
