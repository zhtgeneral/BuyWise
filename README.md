# ![BuyWise Logo](https://i.imgur.com/dT2YmiJ.png)

# **BuyWise**

> **Smarter Shopping Starts Here.**
>
> By *TEAM 10 - Chris Tang, Brandon Kato, Dhruv Khanna, Zhong Tan*

---

**BuyWise** is a web application designed to streamline the online shopping experience by connecting users to their desired products quickly and efficiently across a wide range of popular e-commerce platforms.

Our platform allows users to:

* 🔍 **Search for items** across platforms like **Amazon**, **Walmart**, and **Kijiji** using **natural language**.
* 🛒 **Retrieve and display products** from third-party platforms in an intuitive, attractive interface.
* 🤖 **Get AI-driven recommendations** based on past searches and user preferences.
* 🧑‍💻 **Customize accounts** for a more personalized shopping experience.

---

## 🚀 **Key Features**

* **Cross-Platform Search**: Aggregate search results across Amazon, Walmart, Kijiji (and more coming soon).
* **Natural Language Processing**: Search by typing what you want — no complicated filters.
* **Personalized Recommendations**: AI-driven suggestions based on your interests and search history.
* **User Profiles**: Customize preferences including:

  * Age range
  * Brand preferences
  * Apparel sizes
  * Conversation history
* **Data-Driven Enhancements**:

  * Improve LLM (Language Model) prompts with user data.
  * Suggest complementary products based on past searches and shopping behavior.
* **Future Plans**:

  * Expand support to more e-commerce platforms.
  * Explore training a **predictive machine learning model** for enhanced recommendations beyond the LLM.

---

## 🗈️ **Wireframes**

**Main Page — Product Search Input**

![Main Page Wireframe](wireframe_prompt.png)

> *Figure 1. Main page for users to input natural language product queries.*

---

**Profile Page — User Customization**

![Profile Page Wireframe](wireframe_profile.png)

> *Figure 2. Profile page showing personal information and editable fields.*

---

## ⚙️ **Getting Started**

### 🐳 Docker Setup

```bash
docker compose build
docker compose up
```

Then navigate to:
👉 `http://localhost:5173` in your browser.

---

## 📚 **Technologies Used**

* **React.js + Vite.js** — Frontend framework and fast frontned tooling
* **MongoDB + Mongoose** — Database
* **JWT** — Authentication and user management
* **Docker** — Containerization and easy deployment
* **Natural Language Processing** — For intelligent search interpretation
* **LLM (Language Models)** — For dynamic product recommendation generation
* **Mocha, Chai, Sinon + Mocha reporter** — For integration testing of REST API endpoints and test reporter

---

## 👥 **Team**

* 🚀 Powered by the BuyWise Team

---

## **Milestone 1**
With this milestone, we have developed the core front-end of our app. The user login feature has now been implemented through Auth0, and the overall style and atmosphere of the app have been established using the component and style library Mantine. We have added the home page and built the basic functionality and design for the AI chat interface, user profile editing pages, and the dynamically populating product grid. Additionally, we have made some minor updates to the docker container architecture as well as to the back-end to prepare for the API endpoints that we will integrate into our app as both the front-end and back-end components are developed in parallel.

---

## **Milestone 2**
With this milestone, we developed the backend and databse of our app. We also began adding in core funcitonality of our BuyWise chat where users can find products with the help of SerpAPI. We also made the decision to create an internal account authenticaion system. Although we are still working through bugs and kinks we currently have a proof-of-concept model of what we would like to iterate on. There a few tests created and through the next iterations we will expand and increase coverage.


## **Milestone 3**
With this milestone, we updated our AI model to improve the responses and the ability to detect user contexts using LangChain instead of Meta-llama. We added to our suite of REST API with a new route to generate proxy links and save metadata to the database when a linked in clicked on. We created integration tests and improved backend validation. 

Proxy API and updated chatbot guides are available in the M3 demo video.
Below is the guide to open the test report and to visit the updated API docs.

#### With Docker

Run all containers:
`docker-compose up --build`

To run the tests within docker:
- Wait roughly 30 seconds or until the tests pass
- visit `http://127.0.0.1:8080` and follow the files to the test report.

To visit the updated API docs:
- visit `http://localhost:3000/api-docs`

#### Without Docker

To run the tests and the reporter from root
```
cd server ; npm run test:integration ; npm run test:integration:report
```
- visit `http://127.0.0.1:8080`
- click on `integration-tests.html`


#### Updated API docs

To run the backend service:
- ensure `/server` directory
- `npm run dev`
- visit `http://localhost:3000/api-docs`

---

## **Known Issues**
- SerpAPI running out of tokens for our search functionality - 6/20
- Authentication platform currently tries to create a profile using the same userID throwing a duplicate entry error - 6/20
- Navigation between `/chat` or `/profile` from sidebar will bring user into `/login` - 6/20
- Logout button render issues - 6/20