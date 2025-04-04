# Soil Thingy

## Overview
Soil Thingy is a web application that connects to Firebase to display real-time sensor data, such as temperature and humidity, from a sensor. The data is displayed on the frontend using React, styled with Tailwind CSS, and visualized through charts. Users can interact with the data, adjust the range of data displayed, and explore the sensor readings.

## Prerequisites

Before running the project, make sure you have the following installed on your machine:

- Node.js (v14.x or later)
- npm (v6.x or later) or yarn
- Firebase account (for the Firebase Realtime Database)

## Setup Instructions

1. **Clone the repository**

Start by cloning the project repository to your local machine:

```bash
git clone https://github.com/yourusername/soil-thingy.git
cd soil-thingy
```

2. **Install dependencies**

Install the project dependencies using npm or yarn. Run one of the following commands:

`npm install`

or

`yarn install`


3. **Set up Firebase configuration**

Go to the Firebase Console.

Create a new Firebase project or use an existing one.

Get the Firebase configuration from the Firebase project settings.

Create a new file in the `src/directory` and name it `firebaseConfig.js`.

Paste the configuration you got from Firebase into `firebaseConfig.js`.
Example `firebaseConfig.js`:

```
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-database-name.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
```


4. **Start the development server**

After installing the dependencies and setting up the Firebase configuration, start the development server using one of the following commands:

`npm run dev`

or

`yarn dev`

The app should now be running at http://localhost:3000 or some other port :]

To run the server open to the public network - start it with the following command:

`npm run dev -- --host`


# Features

Real-time data display: The app fetches and displays sensor data from Firebase in real-time.

Data visualization: Data is shown in a table format and can be plotted for better visualization.

Range selector: A slider is provided to adjust the range of data shown.


# Troubleshooting

If you encounter issues with dependencies, try running `npm install` or `yarn install` again.

Ensure that the Firebase project configuration is correct in firebaseConfig.js.


# License

This project is open-source and available under the MIT License.