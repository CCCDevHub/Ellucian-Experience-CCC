# Create Experience Extension

This module bootstraps your Ellucian Experience Extension development by creating an extension project. This module is primarily used to create your initial project. From this, you would add cards and make modifications. This project should be placed under your source control.

# Table of Contents
1. [Workflow](#workflow)
2. [Create Extension Card](#create-extension-card)
3. [Live Reloading The Extensions](#live-reloading-the-extensions)
4. [Developers Resoureces](#developers-resources)

## Workflow

1. Branches
   - **master** (Base Ellucian Experience)
   - **yourCardBranchName** (Development Environment)
2. Procedure
   - Before your work do this to update master branch
        ```
        $ git checkout master
        $ git fetch --all
        $ git pull
        ```
   - Create yourFeature branch from master
        ```
        $ git checkout -b yourFeature origin/master
        ```
   - Do your work, add the files
        ```
        $ git add path/to/the/file
        ```
     - Your extension.js and cardName.jsx files
   
   - Commit your work
        ```
        $ git commit -am "Your message"
        ```
   - Now merge your changes to dev without a fast-forward
        ```
        $ git checkout dev
        $ git merge --no-ff yourFeature
        ```
   - Now push changes to your branch
        ```
        $ git push origin yourBranchName
        ```


## Create Extension Card

1. Run this before working on the card

    ```
    npm install
    ```

2. Copy sample.env

    - For Unix based systems:

        ```
        cp sample.env .env
        ```

    - For Windows based systems:

        ```
        copy sample.env .env
        ```

3. In the .env replace <upload-token> with an extension token from Experience Setup.

4. Example of a card:
    ```
    import React from 'react';
    import { withStyles } from '@ellucian/react-design-system/core/styles';
    import PropTypes from 'prop-types';

    // Your Style Sheet
    const styles = () => ({
        card: {
            marginLef: '1rem',
            marginRight: '1rem'
        },
        image: {
            width: '100%',
            height: 'auto'
        }
    })

    // Your Main Function
    function ViewMySchedule(props) {
        const { classes } = props;
        return (
            <div className={classes.card}>
                <h1>View My Schedule</h1>
                <img className={classes.image} alt="" src="https://southpasadenan.com/wp-content/uploads/south-pasadena-news-05-12-2020-pcc-pasadena-city-college-campus-01.jpg" />
            </div>
        );
    }


    ViewMySchedule.propTypes = {
        classes: PropTypes.object.isRequired
    }

    // Export Your Card with Style Included
    export default withStyles(styles)(ViewMySchedule);
    ```
5. Work on your card
    - Before deploy, modify extension.js with your info

        ```
            "name": "Extension Name",
            "publisher": "Your Name",
            "version": "1.0.0",
        ```

    - Example for regular card

        ```
        {
                "type": "SampleCard",
                "source": "./path/to/card",
                "title": "Sample",
                "displayCardType": "Sample Card",
                "description": "This card is a sample card",
        }
        ```

    - Example for GraphQL Card

        ```
        {
                "type": "CardName",
                "source": "./path/to/card",
                "title": "Card Title",
                "displayCardType": "GraphQL Query",
                "description": "CardName GraphQL Query",
                "queries": {
                    "getPerson": [
                        {
                            "resourceVersions": {
                                "persons": {min: 12}
                            },
                            "query":
                                `query getPerson($personId: ID){
                                    persons: {persons} (
                                            filter: {
                                                id: {EQ: $personId}
                                            }
                                        )
                                        {
                                            edges {
                                                node {
                                                    id
                                                    gender
                                                    dateOfBirth
                                                }
                                            }
                                        }
                                }`
                        }
                    ]
                }
        }
        ```

    - After you done run

        ```
        npm run deploy-dev
        ```

    - Go to Experience Setup to enable the card & environments

    - Got to Ellucian Experience to make the card available

    - At this point, you have deployed the updated builds. Please re-run `npm run deploy-dev` if you update `extension.js`, `package.json`, or add a new card.

**NOTE:** This is using the real Experience Dashboard so your extension will not be visible until it is fully set up. This means you must enable your extension in Experience Setup and configure your card(s) in the Dashboard. This will be required each time you change your extension's version number.

## Live Reloading The Extensions

1. After deployed and enabled, you can live reload the extension by running

    ```
    npm start
    ```

2. The server uses local port `8082` to communicate with the Experience Dashboard, by default. If that port is not open — or you need to use a different one, for any reason — you can specify an override. To do this, create a `.env` file if not already created and add the `PORT` environment variable with the port value that is available and save the file. EX: `PORT=8989`. Now run the below command.

    ```
    npm start
    ```

3. Now you can open the Experience app on any instances such as https://experience-test.elluciancloud.com/.

4. To put the Experience app into live reload mode, follow the steps given below.

    - Open browser developer tools
    - Go to the console tab of developer tools.
    - Run this function `enableLiveReload([optional-port-number])` from the console tab. NOTE that if you have launched the extension app on port other than the default `8082` port then provide the same port number while enabling live reload for Experience app.
    - Refresh the Experience app.

After you refresh the app, the cool thing is that only your extensions will show up. Make sure to bookmark your extensions. Now when you make changes to your extension code, locally, you'll see those changes reflected automatically and instantly in your browser, for both cards and pages. There will be no need for an explicit browser reload.

To disable live reload, run this function `disableLiveReload()` from console tab.

**NOTE** that changes to extension metadata (`package.json` and `extension.json`) will not be automatically picked up by live reload, nor will newly-created cards and pages. To see these changes, run the below command. Notice the `forceUpload` command-line argument, this will force the assets to be uploaded with the same version.

```
npm run deploy-dev -- --env forceUpload
```

## Developers Resoureces

- [Path Design Systems](https://path-designsystem.elluciancloud.com/#/)
- [Ethos Integration API](https://resources.elluciancloud.com/bundle/ethos_integration_gov_standards/page/c_ethos_int_standards.html)
- [Ellucian Experience Documentation](https://resources.elluciancloud.com/bundle/ellucian_experience_lrn_getstarted/page/c_about_experience.html)
- [Ellucian Developer Resources](https://resources.elluciancloud.com/category/developer_resources)
- [HTML DOM Style Object](https://www.w3schools.com/jsref/dom_obj_style.asp)
- Ellucian Experience Videos Training
  - [Getting Started](https://training.ellucian.com/share/asset/view/281)
  - [Build a Card From Start to Finish](https://training.ellucian.com/share/asset/view/282)
  - [Card & Page](https://training.ellucian.com/share/asset/view/284)

### Watch and upload extensions

The command `npm start` has been repurposed to put the extension app into live-reload mode. To watch the changes and automatically deploy the updated builds, you can run the below command.

```
npm run watch-and-upload
```

**NOTE:** This is using the real Experience Dashboard so your extension will not be visible until it is fully set up. This means you must enable your extension in Experience Setup and configure your card(s) in the Dashboard. This will be required each time you change your extension's version number.

## Extension Manifest

When an Extension is bundled for uploading to Ellucian Experience, the information specified in the src folder (cards and i18n), package.json, and extension.js file are used to generate a manifest.json file which provides the Ellucian Experience framework the information it needs to handle the creation and management of the Extension and its Cards.

The extension.js file located in the root of the extension folder defines the Extension package containing one or more Cards. This includes identifying information about the Extension as a whole, configuration attribute definitions for the Extension, as well as Card-specific attributes for each Card contained in the Extension.

| Attribute     | Description                                                                                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| publisher     | The organizational name of the extension publisher, such as 'Ellucian' or 'Drexel'                                                                                                                                                                         |
| name          | The internal name of the Extension (this is not displayed to users) - should match the package.json name, but doesn't have to. Note this name should not change once the extension is in use. The extension name is used to generate a namespaced card ID. |
| configuration | Define configuration values shared among the Extension Cards in this object. These configuration values appear in the Configure step when a card manager is configuring a Card contained in the Extension.                                                 |
| cards         | The list of Cards present in the Extension package.                                                                                                                                                                                                        |

Each card in the cards array has several required attributes.

| Card Attribute  | Description                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type            | A unique key to identify the type of the Card. No spaces should appear in the type. Once the extension is distributed to users, you should not alter this value as it is a key identifier |
| configuration   | Define configuration values unique to the Card in this object. These configuration values appear in the Configure step when a card manager is configuring the Card.                       |
| description     | The default description of the Card. Card managers will be able to override this when configuring the Card for their users.                                                               |
| title           | The default title of the Card appearing to users in the Experience Dashboard. Card managers will be able to override this value when configuring the Card for their users.                |
| source          | The file system path to the Card's source, relative from the Extension root folder. Example: './src/cards/HelloWorldCard' (with or without the .jsx)                                      |
| displayCardType | The type of the card as displayed to card managers on the Card Management page of Experience Dashboard. Example: "Hello World Card"                                                       |

## Utilizing the Setup API

Any of the scripts which deploy the extension can also be used to configure the extension in setup. This is done through additional environment variables in the .env which are:

| Environment Variable               | Description                                                             |
| ---------------------------------- | ----------------------------------------------------------------------- |
| EXPERIENCE_EXTENSION_SHARED_SECRET | A string with a minimum of 32 characters                                |
| EXPERIENCE_EXTENSION_ENABLED       | a javascript boolean (true/false)                                       |
| EXPERIENCE_EXTENSION_ENVIRONMENTS  | a case-sensitive, comma-delimited list without spaces (Tenant1,Tenant2) |

You can define any combination of these, none are required. These features correspond to the same toggles present in the Setup Application's UI.

## Package Scripts

Below is a short description of the scripts found in package.json.

| Script           | Description                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| build-dev        | Package the development build.                                                                                                                 |
| build-prod       | Package the production build.                                                                                                                  |
| deploy-dev       | Package and deploy the development build.                                                                                                      |
| deploy-prod      | Package and deploy the production build.                                                                                                       |
| watch-and-upload | Package and deploy the development build while also watching for changes to automatically deploy updated builds.                               |
| start            | Package the development build and run a websocket server where changes are served directly from your development machine. No reload necessary. |
| lint             | Run eslint to check code against linting rules.                                                                                                |
| test             | Run unit tests via Jest                                                                                                                        |

## Sample cards

Creating an experience extension will also create a sample card, with a page to help demonstrate how props and hooks can be used in the Ellucian Experience Software Development Kit (SDK). For more of our sample cards, visit: https://github.com/ellucian-developer/experience-extension-sdk-samples

## Code checking

The project is also set up to check for coding errors and best practices. By running eslint (npm run lint), the code will be statically analyzed to find problems based on the rules established in .eslinitrc.json.
