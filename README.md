<a id="readme-top"></a>

<div align="center">
    <a href="https://www.aquanow.com/">
    <p><img src="https://public.rootdata.com/images/b16/1666707618091.jpg" alt="Logo" width="400" height="250"></p>
  </a>

  <h1 align="center">Aquanow QA Automation Exercise</h1>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-assignment">About the Assignment</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#framework-used">Framework Used</a></li>
        <li><a href="#how-to-run-test">How to run test</a></li>
      </ul>
    </li>
    <li><a href="#about-author">About Author</a></li>
    <li><a href="#issues-i-noticed">Issues I Noticed</a></li>
  </ol>
</details>

## About the Assignment

**API Task**

Imagine you have just joined your new team, and your first task is to provide automated test
coverage for a new feature, RFQ trades. This is a new feature that has no automation. Only
exploratory testing has been done.
RFQ is a type of trade also known as request for quote. There are two parts to an RFQ trade,
the quote and executing the quote. Once a trade has been executed it becomes an order.
Your goal is twofold:

1. Write a suite of tests around RFQ trades for the API.
2. Automate the tests so they don’t require any manual steps.

<p align="right">[<a href="#readme-top">back to top</a>]</p>

## Getting Started

### Framework Used

Playwright

### How to run test

npm playwright test

<p align="right">[<a href="#readme-top">back to top</a>]</p>

## About Author

**Hello, I'm Rohit 👋**

I am a passionate and skilled Quality Assurance Engineer with hands-on expertise in a variety of testing tools and libraries, such as Cypress, TestComplete, Selenium, RestSharp, RestAssured, Postman, JMeter, TestNG. My proficiency extends across multiple programming languages, including Java, C#, VBScript, and JavaScript.

Throughout my career, I have successfully designed and implemented robust test strategies and automated frameworks, integrating them into CI/CD pipelines to ensure smooth and efficient quality assurance processes, especially in fast-paced Agile environments. I’ve been actively involved in all stages of the Software Development Life Cycle (SDLC) and Testing Life Cycle (STLC), collaborating closely with product owners and stakeholders to deliver software releases that meet both functional and non-functional requirements.

In addition to my technical expertise, I thrive on mentoring and supporting team members through code reviews, pair programming, and providing technical guidance. My goal is always to not only meet testing goals but also improve processes, reduce inefficiencies, and enhance the quality of the final product.

I’m always eager to take on new challenges, whether it’s diving deeper into cloud platforms or experimenting with the latest tools and technologies in the QA field.

On a personal note, I live in Victoria, BC with my wonderful wife and our 2-year-old twin daughters. Family is a big part of my life, and I cherish the balance I’ve created between my career and my loved ones.

Let's connect and collaborate! 🚀

<p align="right">[<a href="#readme-top">back to top</a>]</p>

## Issues I Noticed

**Issue 1 - POST request to execute the quote throws Internal server error**

<ol>
<li>Get Bearer Token</li>
<li>Request Quote and fetch quoteId</li>
<li>Use quoteId in executing the code</li>
<li>Reponse is 500 Internal server error</li>
<li>Error message is 'waiting on processor conversionProcessor timed out'</li>
</ol>

<p align="right">[<a href="#readme-top">back to top</a>]</p>
