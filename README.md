# Treasure Hunt with QR Codes
In [this tutorial](https://docs.onirix.com/tutorials/ipsum-hunt-tutorial) you will learn to set up and customize an AR scavenger hunt for events.

## Step 1: Get the code
The first thing you need is to download our template project from the **Onirix** repositories on Github. Open this link in a new tab, login with your GitHub account and select the _Fork_ option and fill the form. Through the _Fork_ functionality you will be able to make a personal copy of this repository and modify it freely.

After the _fork_ is created, click the _Clone_ button and copy the link inside. Now, open a terminal in the desired folder and execute the “_git clone_” command followed by the URL you just copied. This will create a local copy of the repository in the folder.

Once it is downloaded, you can open it in your _IDE_ of choice and take a look at the content. However, before you run and test the project, you need to set up **Firebase** to store the data (events, users, etc) of the scavenger hunt.

## Step 2: Set up Firebase
The Ipsum Hunt example uses **Firebase** to store and consume the data generated in the application and thus you will need to create a **Firebase** account using your Google account and configure a new project to connect it to the application.

### Create Firebase project
Once you are logged in on **Firebase**’s console, choose the “_Add project_” option. This will take you to the creation form, input the name for the project, enable (or disable Google Analytics for the project). If you choose to enable it, you will need to create an account on Analytics and Google will automatically create a new property for this project.

![Creating Firebase project](https://user-images.githubusercontent.com/15238295/167630303-c0a66393-a7cb-439a-92d7-cafb08f7df9b.png)


!!! If you are interested in setting up Google Analytics on an Onirix Web AR experience check [this tutorial](https://docs.onirix.com/tutorials/include-google-analytics-in-web-ar).

Finally, select create project, wait for the process to complete and click _Continue_. 

### Add and configure the application
In the project overview page, select the </> icon in order to add a web app to the project, fill in the field with the name of the app (in this case “Ipsum Hunt”) and click _Register app_.

After a short wait, **Firebase** will provide you with all the information you need to connect to it from the app. It will look something like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSyAiVB3GIJfmf25CU-OAVE7B1kOkJON1_9s",
  authDomain: "ipsum-hunt.firebaseapp.com",
  projectId: "ipsum-hunt",
  storageBucket: "ipsum-hunt.appspot.com",
  messagingSenderId: "753250555185",
  appId: "1:753250555185:web:988af74a50930dca144c10",
  measurementId: "G-JNBYV3VLJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

Once you have copied it, head to the **index.ts** file under **client > src > services > firebase.service.js** in your project local repository and paste the values here:

![Firebase service code](https://user-images.githubusercontent.com/15238295/167631069-e4ba84c5-5d15-4034-a26a-16fd3eb0b0e2.png)

If you need to view this information again, in the dashboard, click on the project’s name and press the gear icon. This will lead you to the project’s settings where you can check the SDK configuration at the end of the page.

![Firestore data in the dashboard](https://user-images.githubusercontent.com/15238295/167631137-d982b124-9c1d-4395-85db-796735133bf8.png)

### Create the database
Navigate to **Firestore Database** through the sidebar on the dashboard and select “Create database”. A creation wizard will appear, click next and select the desired location for you **Cloud Firestore** storage.

![Database creation](https://user-images.githubusercontent.com/15238295/167631203-be641e61-04d6-45e0-b138-67f3af7a92f4.png)

In this case the example was set up in _europe-west_, nevertheless you should choose your own region or the one where the project will be used. Click enable and after a short wait your database will be created.

![DB created](https://user-images.githubusercontent.com/15238295/167631327-ac5c4058-defc-469e-bc31-bf66e8bd9588.png)

Once it’s created, you will need to copy the name of the **Firebase** application (in this case “ipsum-hunt”) and paste it on the **.firebaserc** file “default” field. You will also have to change **Firestore** region to the one you selected on two files:
* On backend > functions > src > index.ts.

![Backend region](https://user-images.githubusercontent.com/15238295/167631542-56fa6a0d-9cce-4d0f-accb-d8feb2333955.png)

* On client > src > services > firebase.service.js.

![Client region](https://user-images.githubusercontent.com/15238295/167631409-278bac0a-b833-4b44-9573-023307ad9d5e.png)

### Authentication
In this example the authentication is handled directly with **JWT** tokens saved on the **Firebase** collections. The only requirement to start using this approach is defining a secret for the **JWT** and generating a token for the Admin user. The defined secret should be written in the _CONSTANTS_ object on **index.ts**. 

After creating it, go to the backend > functions > scripts folder and execute (node) the **tokenService.js** script setting the _jwt_secret_ to the one you just defined. Then, copy the generated token printed on the console and paste on client > src > services > firebase.service.js.

![FirebaseService admin token](https://user-images.githubusercontent.com/15238295/167631643-78f05467-5cb7-40c9-b48e-ee929f7824f8.png)

Nevertheless, you can set it up with your authentication method of choice. For example, under the _Authentication_ options on **Firebase**’s dashboard, Google provides many different types of authentication that can be enabled and configured for your project.

## Step 3: Set up mail notifications
When the registered users forget their password and ask for a new one, the application handles it through emails. For this to work a mail service will be needed, in this example [**Sendgrid**](https://sendgrid.com/) is used. However, you can utilize any that you prefer and then change the code accordingly.

To set it up with **Sendgrid**: 
1. Create a new account and follow their documentation to generate an **API key**.
2. Then copy this key and paste it on the _CONSTANTS_ object in **index.ts**. 

You will also need to write the email address that will be used as the sender of the notifications and the URL of the domain where your application will be hosted.

## Step 4: Connect to Onirix Studio
The next step is to create an **Onirix Studio** account and build a new AR project that can be connected to the Ipsum Hunt example.
Navigate to https://www.onirix.com/ , choose the “Register” option on the top right corner and fill both parts of the form and validate the account.

Once you are logged in **Studio**, you will be presented with several videos, tutorials and some premade assets and projects that you can use to get familiarized with the tool. You can start by creating a new project and building it following some of the other Studio tutorials like:
* [Car configurator](https://docs.onirix.com/tutorials/embed-sdk-and-online-code-editor)
* [Geolocated Treasure Hunt](https://docs.onirix.com/tutorials/geolocated-treasure-hunt)

### Create Scavenger Hunt experiences
A Scavenger Hunt consists in capturing certain elements that will appear in the AR experience. Where and when these objects appear is configured through the scene editor of **Onirix Studio**. So, the first step is creating a new [surface scene](https://docs.onirix.com/onirix-studio/projects/surface).

To achieve this, you need to create a new Project and name it. Once it’s created, the form to create a new scene will show up. Select surface type and input a name. Then, click the “Share” button on the top right corner of the page and make sure that the project is set to “Public” as it needs to be public in order to be consumed from the web or the app.

Inside the scene editor, you will now have to add the game objectives that the user will need to capture on their mobile phones. For this to work correctly, the most important step will be to name the elements (one or more) that form your objectives so they can be correctly identified. For example, if your objective is formed by logos, you will have to add elements with the name “logo” to the scene. 

![Change element name in Studio](https://user-images.githubusercontent.com/15238295/167631714-7eb2037c-ef64-4368-b153-5fc774fed9db.png)

To complete the game, the user will have to capture (click) in every objective element that we add to the scene. In order for the client to know which elements are part of the game objectives and how many points does each one give, their names in studio and the number of points must be written in **ExperienceVue.js**.

```js
const logoNames = ["logo1", "logo2"];
const logoPoints = [10, 20];
```

> You can add more elements with different names to the scene, but they will not be taken into account for the game’s score if they are not in the code.

### Set up the token
After you have created a project and the scenes that you want to play on the web application, you need to set your **Onirix API key** on the client so it can read your Studio data and pull the projects and scenes.

To achieve this, select the project that you have just created, click the _Settings_ button on the top right corner, look for the “Onirix token” section and click “**Copy Onirix token**” to copy your key to the clipboard. Finally, paste it on the **.env.development** and **env.production** files in the client folder.

![Environment variables](https://user-images.githubusercontent.com/15238295/167631762-de15effa-af8b-4b1f-8f78-c996fd9ac130.png)

Once this is set up, you can start to develop the experience.

## Step 5: Run your Scavenger Hunt
After you have cloned the project code, configured **Firebase**, registered on **Onirix** account, designed the scenes associated with the hunt and written all the API keys, you can start testing the application and developing it more.

To accomplish this, launch the application on localhost following the next steps:
1. On one terminal window, navigate to the functions folder inside the backend one.
    1.1. Run _npm install_ to get all the npm packages.
    1.2. Then, _run npm run build:watch_ so a new bundle is built after every change.
2. On another terminal, navigate to the backend folder.
    2.1. Execute _firebase init emulators_ and select at least _Functions_, _Firestore_ and _Storage_.
    2.2. On the same terminal, _run firebase emulators:start_.
    4.3. You should be able to see the **Firestore Emulator Suite** on http://localhost:4000. 
3. On another terminal, navigate to the client folder.
    3.1. Execute _npm install_ to get **Vue** and the other packages.
    3.2. Run _npm run serve_ in order to deploy the web client on port 8080.

> Apart from third party packages, the client application depends on two Onirix libraries: [@onirix/api-client](https://www.npmjs.com/package/@onirix/api-client) and [@onirix/embed-sdk](https://www.npmjs.com/package/@onirix/embed-sdk). Make sure everything is correctly installed when running _npm install_.

### Create the event
With everything up and running, navigate to http://localhost:8080/admin to see the administration options of the application.

As there is no created event because you have just started the app, it will automatically ask you to define one. In this example an event just has two properties:
* Event name.
* Event logo.

<img width="360" alt="createevent" src="https://user-images.githubusercontent.com/15238295/167653729-5ad23d9d-5b5a-4ab4-9a5c-b5afb451c1a1.png">

> You can cancel the form and keep using the app, however an event is needed in order to actually play the experience.

### Add some booths
Once you have created the event, you will have to create some booths where the images that serve as a start point for the AR experience will be defined. To achieve this, navigate to the “Booths” tab, select “New booth” and fill the form.
In this example the Booths have the following properties:
* Booth name.
* Description.
* Location.
* Booth logo.
* Onirix project: the AR project that will be associated with this booth.
* Onirix scene: the scene from the project that will be active.

<img width="360" alt="Booth creation form" src="https://user-images.githubusercontent.com/15238295/167632159-512a3eeb-eecb-4b62-8204-e9cee958944a.png">

After saving the booth, you will be able to see its information on the table. It will include the URL and the QR code generated to access the booth’s AR experience. All the booths can be edited and deleted from this tab.

![Booths tab](https://user-images.githubusercontent.com/15238295/167632236-9b6363f7-5057-4083-96a0-d1fecce8a0ad.png)

> When users register on the app, their information will appear in the Registered tab and, when they complete a game, the data of each execution will be present in the Played games tab.

### Test the game
Now that you have created an event and some booths with AR experiences linked, you can test them and play the game from the client.
First, open a booth’s game link on a new browser window. There you will be greeted with the landing page of the experience.

<img width="180" alt="Client landing page" src="https://user-images.githubusercontent.com/15238295/167632333-82a14520-c603-4aa9-b2cd-fc15188c2c44.png">

> You can also generate a QR with the IP address marked as public on **Vue** console and the path of the game URL and scan it from your phone.

As it is the first time that you open the client, there aren’t any users created and thus you will need to click the button and create a new one filling both steps of the form.

<img width="180" alt="Register form" src="https://user-images.githubusercontent.com/15238295/167632432-55b3883e-c627-44d9-829f-2cbf9cf52c56.png">

After successfully registering, you will be greeted with the tutorial on how to play.

<img width="180" alt="How to play 1" src="https://user-images.githubusercontent.com/15238295/167632520-0496344a-f53e-4ee9-8099-f8859a9578c9.png">

Then the **Onirix** app will be loaded and you will be able to start playing after scanning the markers. From every window of the application, you will also be able to check all the available booths (the completed ones will be marked as such), your score and the instructions if you need them again.

<img width="180" alt="Welcome view" src="https://user-images.githubusercontent.com/15238295/167632693-3b63b463-c157-48ef-b6ae-d39d5e7872de.png"><img width="180" alt="Booths view" src="https://user-images.githubusercontent.com/15238295/167632709-29e59de1-a534-409a-8caa-de1dfacd2c6b.png">

## Step 6: Deploy your Scavenger Hunt
In order to deploy your own scavenger hunt on a server, you will have to deploy the custom Firebase functions, serve the clients bundle from a server or cloud service and secure the administration panel so only the managers of the application can access it.

### Deploy firebase functions
To correctly deploy the firebase functions on **index.ts** to the online **Firebase** application, you will need to open a new terminal and run the command _firebase deploy_. This will compile the code, connect to Google’s cloud services and deploy the functions there.

> To achieve this you will need to upgrade your **Firebase** plan to the “Blaze (pay as you go)” billing plan.

### Generate and serve the client’s bundle
After the **Firebase** backend is deployed, your next action should be to serve the web application so it can be publicly accessed.

To achieve this, first, navigate to the client folder and, from a terminal, run _npm run build_. This command will compile the **Vue** application and generate in the “dist” folder all the files that you need to deploy in a server. Although an **Apache Server** was used for this example, you can deploy this with your tool of choice (AWS, Google Cloud, Window Server, …).

![Generated dist folder](https://user-images.githubusercontent.com/15238295/167633030-c94836ab-f15d-4c5e-ac4e-bbe3f1d26630.png)

### Secure the administration panel
As you already saw, this application is divided in two different parts: the administration panel and the client (phone oriented) zone. Through the first one, the manager of the events can create, edit and delete events and booths, and also can inspect the data generated by the users of the AR experience (registered users and the games played by them). On the second part, the user can register if they are a new user, log in with their credentials if they already participated before, read the game instructions, check the available booths and, of course, play with the AR scenes.

As the name indicates, the administration panel should be exclusive to the managers of the application and as such has to be protected from the public. In order to achieve this, in this example [**Nginx**](https://www.nginx.com/) was used but, as mentioned before with the email or the storage, you can implement your preferred method of security.

If you opt for using Nginx for deploying the app, you can protect the admin location from your Nginx configuration file like:

```
location / {
	try_files $uri /index.html;
}

location /admin {
    auth_basic "Administrator's Area";
    auth_basic_user_file /etc/nginx/.ipsumhunt.htpasswd;
    try_files $uri /index.html;
}
```

For more information on how to achieve this HTTP security with Nginx and how to generate the _htpasswd_ file check their [documentation](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/).
