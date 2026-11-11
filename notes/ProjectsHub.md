## Finance
Purpose - Sharing my journey into personal finance. Sharing ideas and thoughts about a complex world. 

The goal of this three step journey (from Excel to FinanceCopilot n8n workflow) is to create systems that reduce research time, improve accuracy, and create rigid rules to guide a lifelong investment strategy. 
The ambitious desire is to overperform the major global indexes (MSCI world) over the long run (almost impossible, but necessary to try)

- **Excel financial modeling:**
  *Started 10/2025 - Last Modified April 04/2026*

  [GitHub Repo](https://github.com/holylore/Portfolio-Strategic-Analysis) - [Kaggle Notebook](https://www.kaggle.com/code/lorenzopardini/strategic-portfolio-analysis-risk-management)

  Portfolio analysis in Excel: Sharpe ratio, Pearson correlation, benchmark comparison.

  Status: live (the base model).

  What I learned: financial modeling through Excel and Google Sheets, the importance of writing down everything and keeping track of core things, the importance of data and context, to filter signal from noise.
  
- **Google Colab Python:** 
  *Started: 04/2026 - Last Modified: June 2026*
  
  [GitHub Repo](https://github.com/holylore/All-Weather-Contrarian-Alpha-Portfolio-Optimizer) - [Kaggle Notebook](https://www.kaggle.com/code/lorenzopardini/all-weather-contrarian-alpha-portfolio-optimizer)
  
  Markowitz mean-variance portfolio optimization, built with AI-assisted coding. 
  
  Status: live, used for allocation decisions and review.
  
  What I learned: testing as a crucial way to prove your theories, vibe coding and leveraging Python to create easily understandable visuals, the role of context and precision. 
  
- **FinanceCopilot:** 
  *Started 09/2026 - In Progress*
  
  Personal financial assistant. Double function, local database of SEC 10-K filings, live market data (price and analyst analysis) from Yahoo Finance, and live portfolio data via Scalable Capital CLI for my holdings, queried from Telegram through n8n. 
  Answers only from the database and never directly gives buy or sell advice. It answers only about the company's quality and fit for my portfolio.  
  
  Status: in progress.
  
  What I learned: to not trust an LLM, hallucinations are too frequent, especially on smaller models, leveraging code to produce deterministic outputs, the importance of leveraging data to create accurate output, smaller tools can be more effective compared to "better" tools if they are appropriately fine-tuned. 
  
## Automation (n8n)
Purpose - Removing friction in daily activities while keeping quality high. Automations are designed to integrate directly into daily life and free up time for more important work or time to dedicate to personal life or family. 

Goal - DailyDigest
The goal of the newsletter I created is filtering the noise, creating a unified hub in which I can read news without having to scroll for hours every day.  

- **Daily newsletter (DailyDigest):** 
  *Started: 09/2026 - Last Modified: 10/2026*
  
  [GitHub Repo](https://github.com/holylore/DailyDigest---a-n8n-WorkFlow) - [Kaggle Notebook](https://www.kaggle.com/code/lorenzopardini/dailydigest-n8n-workflow)
  
  Started 
  Collects RSS feeds, filters and summarizes them with Mistral (free tier API key connection), and sends one brief to Telegram each morning. 
  
  Status: live.
  
  What I learned: the importance of filtering signal from noise, coding as a crucial measure to force LLMs to produce coherent outputs, filters are necessary to prevent bad results. 
  
Goal - PreplyCopilot (semi automated Notion CRM)  
The goal of PreplyCopilot is to remove friction for my girlfriend (Pei) during her daily job as an online mandarin tutor. She struggled to keep her database in order and lost time and energy while doing everything manually. 
The goal was to minimize the time dedicated to this process, making it easier and as user friendly as possible, and remove the friction of having to use a laptop to allow her not to postpone the job and increase accuracy. 

- **PreplyCopilot, CRM for Pei:** 
  *Started: 09/2026 - Last Modified: 10/2026*
  
  [GitHub Repo](https://github.com/holylore/PreplyCopilot-n8n-WorkFlow)
  
  n8n workflow to manage data entry for new students and lessons for every student. 
  The workflow was built on top of a pre existing Notion CRM that Pei (my girlfriend and the client in this case) built. I perfected the Notion CRM to make n8n work with it smoothly. 
  
  The database has two separated table which are related natively in Notion. 
  The main table stores every single student, while the second table stores lessons for each student. Lessons can be accessed directly from the main table and filtered by student name. 
  
  Status: live.
  
  What I learned: the importance of setting up the infrastructure correctly before working, it saves time and avoid bugs or problems, code as a way to prevent mistakes, accepting limits of simpler tools (Gemini audio LLM or similar) and trying to compensate with core competences such as workflow architecture, correct code base, and an effective CRM built on Notion.
  
Goal - FreelanceCopilot
The goal is to stop wasting time applying for jobs (something I hate). Remove friction while being able to filter noise and easily find jobs that match my abilities and interests. 

- **Job procurement workflow:** 
  *Started 10/2026 - Paused (works postponed, not a priority at the moment)*
  
  Scheduled brief that leverages selected sources, keyword filtering, Google Sheets as a database, an LLM to summarize, and Telegram to send tailored. 
   
  Status: paused.
  
  What I learned: job postings differ significantly from other types of data, RSS sources must be of a good quality, filter are necessary for a correct report. 
 
## Data
Purpose - Improving my chess skills by analyzing all games I ever played on Chess.com. Focusing on uncovering patterns and fixing mistakes. 

The goal of this project is pretty simple, finding where I lose the most point and discovering if there are any recurring mistakes played.
 
- **Chess.com analysis:** 
  *Started: 10/2026 - Last Modified: 11/2026*
  
  Python pipeline loading 11,000+ personal games into a local DuckDB file, analyzed in a Jupyter notebook. 
  
  Analyzed different metrics such as: most played openings (for all formats and only for rapid), win percentages by time format, win percentage by position type (closed or open), most frequent mistakes played, and brilliant moves. 
  
  Status: in progress (results must be confirmed and leveraged to improve).
  
  What I learned: precisely defining rules is crucial for obtaining and effective result, LLMs need precise guideline to understand prompts, results seem to partially contradict my memories (less brilliances that expected, win percentages are slightly different from what I imagined, etc.). 

## Next Steps
FinanceCopilot will be the main project going forward. I need to integrate the database that has been created into n8n and start testing the "alpha" of the workflow. 

I will focus part-time on analyzing the results of my Chess.com analysis project to actually improve my chess skills. 

Soon I will resume building FreelanceCopilot focusing on freelance gigs and remote jobs. 

As I already did I want to continue supporting my girlfriend building a better stack to make her work easier and save her time. 
This will be a primary focus especially since January when we will go together to Taiwan (her home country). 

If you will be in Taiwan from January to July feel free to reach out :)
## Archive
Here there is a list of failed experiments which I consider to still be potentially relevant to someone and a potential PoW. 

Goal - Dify Experiment
The goal was to automate the first layer of research for companies and uncover potential expansion solutions, potential threats, and new strategies to strenghten their presence. 

- **Dify workflows:** 
  *Started: 04/2026 - Last Modified: 06/2026*
  
  [GitHub Repo](https://github.com/holylore/Multi-Agent-AI-Workflow-for-Business-Intelligence) -  [Kaggle Notebook](https://www.kaggle.com/code/lorenzopardini/multi-agent-ai-workflow-business-intelligence)
  
  Two-step company analysis prototype. Commercial attempt failed; kept as a portfolio demonstration, not a business. 
  
  Status: dropped.
  
  What I learned: build for a real purpose not based on feeling or you will get poor results or no results. 

## Infrastructure 
n8n running locally on my laptop via Docker. I use AI via OpenWebUI (running local models via Ollama or using free tier API keys such as OpenRouter API key) or leveraging Claude. 

n8n is exposed via an ngrok tunnel that grants permanent access. 
