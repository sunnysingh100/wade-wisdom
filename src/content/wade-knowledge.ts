export interface KnowledgeDocument {
  title: string;
  topic: string;
  sourceType: string;
  content: string;
}

export const wadeKnowledge: KnowledgeDocument[] = [
  // ============================
  // STARTUPS & BOOTSTRAPPING
  // ============================
  {
    title: "Seedstrapping: Zapier's Path to $5B Without VC",
    topic: "startups",
    sourceType: "interview",
    content: `# Seedstrapping: Zapier's Path to $5B Without VC

Wade Foster co-founded Zapier in 2011 as a side hustle while working at a job in Columbia, Missouri. Zapier raised only about $1.3 million in seed funding before becoming profitable, eventually reaching a $5 billion valuation. Wade coined the term "seedstrapping" to describe this approach — raising a small seed round to get started, then growing entirely from revenue.

Key principles of seedstrapping according to Wade:
- Raise just enough capital to prove your idea, then grow from revenue
- Profitability gives you freedom — you don't need permission from investors to make decisions
- Be very careful about what you spend money on — every dollar should contribute directly to growth
- Zapier achieved profitability within its first three years of operation
- You don't need to be in Silicon Valley to build a billion-dollar company

Wade often tells founders: "Understand when external funding is a useful tool and when it's not. For Zapier, we found that once we had product-market fit, our self-serve model generated enough revenue to fund our own growth."

The seedstrap approach works especially well for SaaS companies with self-serve models, where you can grow organically through word-of-mouth and product quality rather than burning through venture capital on sales teams.`,
  },
  {
    title: "Don't Hire Till It Hurts",
    topic: "startups",
    sourceType: "blog",
    content: `# Don't Hire Till It Hurts

One of Wade Foster's most famous pieces of startup advice is "don't hire till it hurts." This philosophy shaped how Zapier grew from a tiny team to hundreds of employees while maintaining operational efficiency.

Wade's hiring philosophy:
- Only hire when the pain of not having someone in a role is clearly affecting the business
- Every new hire should be so needed that the team is relieved when they arrive
- Premature hiring creates coordination overhead and dilutes culture
- A smaller team that's aligned and motivated will outperform a larger unfocused one

"The natural instinct for most founders is to hire to solve problems," Wade explains. "But often the real issue is process, not people. Before you hire, ask yourself: can we automate this? Can we simplify this? Can we just not do this?"

This connects to Zapier's broader philosophy of automation-first: before adding headcount, look for ways to automate repetitive work. Zapier practices what it preaches — the company uses its own product extensively to automate internal operations.

The "hire slowly" approach also helps with culture. When you're deliberate about every hire, you can ensure each person truly embodies the company's values and adds to the team dynamic. Zapier looks for customer-focused, empathetic employees and requires all team members to spend time in customer-facing roles.`,
  },
  {
    title: "Solving Real Customer Problems",
    topic: "startups",
    sourceType: "interview",
    content: `# Solving Real Customer Problems

Wade Foster emphasizes that the foundation of any successful startup is solving a genuine customer problem. Even an imperfect solution that addresses a critical need can generate lasting customer enthusiasm.

"We started Zapier because we kept seeing the same problem over and over," Wade explains. "People were using all these web apps, but none of them talked to each other. It was a real pain point that affected millions of people. When we built even a basic version that solved this, people were thrilled."

Key startup advice from Wade:
- Start with the problem, not the technology — find something that genuinely frustrates people
- Your first version doesn't need to be perfect — it needs to work and solve the core issue
- Listen obsessively to customers in the early days
- Build for the customer you have, not the customer you wish you had
- Product-market fit feels obvious when you have it — people start telling others about your product
- "If people aren't banging down your door, you probably haven't found product-market fit yet"

Wade recommends that founders spend significant time doing things that don't scale in the early days: personally onboarding users, writing documentation, and even building custom integrations. This direct interaction with customers provides invaluable insight that shapes the product roadmap.`,
  },
  {
    title: "Startup Advice for the AI Era",
    topic: "startups",
    sourceType: "interview",
    content: `# Startup Advice for the AI Era

Wade Foster believes the AI era presents unprecedented opportunities for startups, but requires a different playbook than traditional SaaS.

Key insights on AI-era startups:
- Software development is being commoditized by AI — the advantage shifts to creative individuals and "idea people"
- New startups can build competitive products with fewer resources and lower operational costs
- Traditional SaaS companies face margin compression as AI-native startups emerge
- The best opportunities are at the intersection of AI and real-world workflows
- Distribution and customer relationships still matter — technology alone isn't enough

"With AI, building software has never been easier," Wade notes. "That means the barrier to entry is lower, but it also means the bar for what customers expect is higher. You need to move faster and iterate more quickly than ever."

For bootstrapped founders, Wade recommends:
- Use AI tools aggressively in your own development process
- Start with small, focused AI features rather than trying to build AGI
- Look at what tasks in existing workflows are still manual — those are your opportunities
- Think about the workflow, not just the AI model — the value is in orchestrating multiple steps`,
  },

  // ============================
  // AI & AUTOMATION
  // ============================
  {
    title: "The 90% Rule for AI",
    topic: "ai",
    sourceType: "interview",
    content: `# The 90% Rule for AI

Wade Foster advocates for what he calls the "90% Rule" — a framework for thinking about AI in business workflows. The core idea is that the best AI implementations are hybrid workflows that blend human intelligence with AI agents.

"You don't need AI to be perfect," Wade explains. "You need it to be good enough to handle 90% of the work, with humans stepping in for the remaining 10% that requires judgment, creativity, or empathy."

The 90% Rule in practice:
- Design workflows where AI handles the repetitive, data-heavy bulk of the work
- Let humans focus on exceptions, edge cases, and high-stakes decisions
- Don't wait for AI to be 100% accurate before deploying — build feedback loops instead
- The 10% human oversight actually makes the AI better over time through corrections
- This hybrid approach is more reliable and builds trust faster than fully autonomous AI

Wade emphasizes that this approach works for both customer-facing and internal use cases. At Zapier, they use this framework for everything from email triage to code review to customer support.

"The companies that will win with AI aren't the ones building the most sophisticated models," Wade says. "They're the ones who figure out how to orchestrate AI and humans together in ways that create genuine value for customers."`,
  },
  {
    title: "AI Fluency as a Hiring Requirement",
    topic: "ai",
    sourceType: "blog",
    content: `# AI Fluency as a Hiring Requirement

Starting in May 2025, Wade Foster made AI fluency a requirement for all new hires at Zapier. This wasn't a blanket "must know ChatGPT" requirement — it was a function-specific evaluation of how candidates actually use AI in their work.

Zapier's approach to AI fluency hiring:
- Developed a four-tier scale: unacceptable, acceptable, adoptive, and transformative
- Each role has specific AI use cases based on how top performers in that role leverage AI
- Hiring tests are built around real-world AI applications, not theoretical knowledge
- The evaluation criteria are updated every six months due to rapid AI advancement
- "When you say, 'hey, show me what you're doing with AI,' you can sniff it out pretty quick"

Wade distinguishes between surface-level and transformative AI use: "There are a lot of people who are like, 'okay, I asked ChatGPT to rewrite this memo.' You're like, okay, you're not doing nothing, but there's a whole other world you can go explore."

The transformative level means using AI to fundamentally rethink how work gets done — not just making existing processes slightly faster, but reimagining workflows entirely.

"AI fluency needs to be defined function by function," Wade emphasizes. "What AI fluency means for a marketer is completely different from what it means for an engineer or a support agent."`,
  },
  {
    title: "Zapier's Code Red: Achieving 97% AI Adoption",
    topic: "ai",
    sourceType: "interview",
    content: `# Zapier's Code Red: Achieving 97% AI Adoption

When GPT-4 launched, Wade Foster recognized it as a defining moment. He initiated what he called a "code red" at Zapier — the entire company stopped all regular work for a week. Every employee, regardless of role, was tasked with building something with AI.

The results were dramatic:
- AI adoption went from under 10% to over 50% in a single week
- By late 2025, Zapier achieved a 97% internal AI adoption rate
- The key insight: "the fear of AI fades once people actually use it"
- Hackathons became a regular practice to keep momentum going

Wade's strategy for company-wide AI adoption:
1. Make it mandatory but fun — frame it as exploration, not compliance
2. Let people build things relevant to their own work
3. Share results widely — "show and tell" sessions during all-hands meetings
4. Celebrate creative uses, not just technically impressive ones
5. Repeat regularly — one hackathon isn't enough, make it a habit

"Most companies talk about AI adoption but then leave it up to individuals to figure out," Wade observes. "That doesn't work. You need to create space and permission for people to experiment. The code red approach worked because it removed every excuse not to try."

The ongoing approach includes regular hackathons, an internal blog for sharing AI projects, and integration of AI tools into daily workflows across every department.`,
  },
  {
    title: "Agentic Workflows vs Full AI Agents",
    topic: "ai",
    sourceType: "podcast",
    content: `# Agentic Workflows vs Full AI Agents

Wade Foster draws an important distinction between "agentic workflows" and "full AI agents," recommending that most companies start with the former.

"Instead of trying to build a fully autonomous AI agent right away, start with agentic workflows," Wade advises. "These combine deterministic steps — things that happen the same way every time — with AI components for the parts that need intelligence."

Key differences:
- **Agentic Workflows**: Structured pipelines with AI inserted at specific steps. Predictable, debuggable, and reliable. Example: automated email triage that uses AI to classify emails, then follows deterministic rules for routing.
- **Full AI Agents**: Autonomous systems that decide their own steps. More flexible but less predictable. Better suited for complex, open-ended tasks.

Wade's email agent example:
- Receives 100+ emails daily
- Uses AI to classify each email by urgency and topic
- Applies deterministic rules to archive, respond, or escalate
- Surfaces the ~10 emails that actually need Wade's personal attention
- "Instead of me answering all these emails, I'm talking to the agent and saying what new instruction can I provide or what new guidance can I give it so that it does a better job"

"Think of AI agents like junior employees," Wade suggests. "You wouldn't give a new hire full autonomy on day one. You'd start them with structured processes and gradually expand their responsibilities as they prove themselves."

This incremental approach to AI deployment reduces risk, builds institutional trust, and creates opportunities to learn and improve before scaling up.`,
  },
  {
    title: "Automation as a Survival Imperative",
    topic: "ai",
    sourceType: "blog",
    content: `# Automation as a Survival Imperative

Wade Foster believes that in 2025 and beyond, automation isn't a nice-to-have for startups — it's a survival imperative. He points to research suggesting approximately 50% of current work activities are automatable.

"The companies that figure out automation will be able to do more with less," Wade explains. "The ones that don't will be outcompeted by leaner, faster competitors who have."

Wade's framework for identifying automation opportunities:
1. Look at your calendar — anything recurring is a candidate for automation
2. Ask yourself: "If I had to do this 10x more, would it still work manually?"
3. Focus on the boring stuff — the tasks nobody wants to do are perfect for automation
4. Start with the 80/20: automate the 20% of tasks that consume 80% of time
5. Measure the impact — track time saved and reinvest it in higher-value work

At Zapier, automation is deeply embedded in the culture:
- New employees are trained on automation tools in their first week
- Teams have "automation budgets" — time set aside to automate their own processes
- The company runs on thousands of Zaps (automated workflows) internally
- "We dogfood our own product to an extreme degree"

"If you can systematically automate work, you've just become one of the most valuable people in the company," Wade says. "That's a skill to run toward, not away from. I know of no CEO where a person came and said 'I have automated my entire job' whose reaction isn't 'holy crap, show me how. I have nine other projects I'm ready to turn you loose on.'"`,
  },

  // ============================
  // PRODUCTIVITY
  // ============================
  {
    title: "Default to Action: Zapier's Core Value",
    topic: "productivity",
    sourceType: "blog",
    content: `# Default to Action: Zapier's Core Value

"Default to action" is one of Zapier's foundational values, and Wade Foster considers it essential to both personal productivity and company culture.

What "default to action" means in practice:
- When you see a problem, start working on a solution instead of waiting for permission
- Break big problems into small, actionable steps and start with the first one
- Bias toward doing something imperfect over planning something perfect
- If you make a mistake, fix it — don't let fear of mistakes paralyze you
- Speed of iteration matters more than getting it right the first time

"In a remote company especially, you can't afford to wait around for someone to tell you what to do," Wade explains. "Information needs to flow freely, and people need to feel empowered to make decisions and take action without constant oversight."

This requires two supporting structures:
1. **Transparency**: Everyone needs access to the information required to make good decisions
2. **Trust**: Management needs to trust that people will generally make good calls, and people need to trust that they won't be punished for well-intentioned mistakes

Wade applies this to product development: "We ship fast and iterate. We'd rather get something in front of customers and learn from their feedback than spend months perfecting something in isolation."

The "default to action" philosophy also extends to how Zapier handles customer support, bug fixes, and internal operations. The goal is to minimize the time between identifying a problem and starting to solve it.`,
  },
  {
    title: "The Automation Mindset for Personal Productivity",
    topic: "productivity",
    sourceType: "podcast",
    content: `# The Automation Mindset for Personal Productivity

Wade Foster practices what he preaches when it comes to personal productivity. He applies an "automation mindset" to his daily work, constantly looking for tasks that can be delegated to systems rather than done manually.

Wade's personal productivity practices:
- Uses Zapier agents to triage his email, reducing 100+ daily emails to the 10 that need his attention
- Leverages meeting transcripts + AI to extract action items and follow-ups automatically
- Built custom AI tools to analyze interview candidates objectively
- Uses AI to review company culture by analyzing meeting transcripts for patterns
- Treats AI tools like junior employees — trains them with specific instructions and feedback

"I spend a surprising amount of my time now talking to AI agents instead of doing the actual tasks," Wade notes. "Instead of answering emails directly, I'm refining the instructions I give my email agent so it handles more cases correctly."

Key productivity principles:
1. **Identify recurring patterns**: If you do something more than twice, it's worth automating
2. **Invest time upfront**: Spending an hour to automate a 10-minute daily task pays off in weeks
3. **Iterate on your automations**: Like code, your automations need maintenance and improvement
4. **Free up mental bandwidth**: The goal isn't just saving time — it's freeing your brain for creative work
5. **Share what works**: When you find a good automation, share it with your team

"The biggest productivity unlock isn't a better to-do list app," Wade says. "It's fundamentally rethinking which tasks should even be on your to-do list in the first place."`,
  },

  // ============================
  // REMOTE WORK & CULTURE
  // ============================
  {
    title: "Building Culture in a Fully Remote Company",
    topic: "remote-work",
    sourceType: "blog",
    content: `# Building Culture in a Fully Remote Company

Zapier has been 100% remote since its founding in 2011, making it one of the earliest fully distributed companies. Wade Foster has strong opinions about what makes remote culture work.

"Culture building in a remote context is not about perks like ping-pong tables," Wade explains. "It's about how people operate daily — the norms, communication patterns, and shared values that define how work gets done."

Zapier's remote culture practices:
- **Over-documenting**: Everything is written down — decisions, processes, context. "If it's not documented, it didn't happen"
- **Transparent communication**: Default to public channels. Private conversations should be the exception, not the norm
- **Asynchronous-first**: Don't assume everyone is online at the same time. Write things down so people in different time zones can participate
- **Weekly pair-buddy sessions**: Random pairing of employees for casual conversations — builds connections across teams
- **Internal blog**: Employees share work updates, interesting findings, and personal interests
- **All-hands with customers**: Regular company-wide meetings where customers share their Zapier experiences

Building community remotely:
- Off-topic chat rooms for non-work discussions
- Regular virtual social events
- Annual company retreats for in-person bonding
- "Culture ambassadors" who help new hires feel connected
- Onboarding includes spending time in customer support — everyone understands the customer

"Remote work isn't about recreating an office online," Wade emphasizes. "It's about building a different kind of company — one that values written communication, asynchronous collaboration, and trust over surveillance."

The benefits Wade sees in remote work:
- Access to global talent — not limited to one geographic area
- Employees have more autonomy over their schedules
- Reduced overhead costs
- Higher retention due to quality of life improvements
- Forces better documentation and communication practices`,
  },
  {
    title: "Hiring and Managing Remote Teams",
    topic: "remote-work",
    sourceType: "interview",
    content: `# Hiring and Managing Remote Teams

Wade Foster has developed specific practices for hiring and managing teams in a fully remote environment. These practices have evolved over more than a decade of building Zapier.

Hiring for remote work:
- Look for self-starters who thrive with autonomy — remote work requires intrinsic motivation
- Evaluate written communication skills heavily — "in a remote company, writing is your primary communication tool"
- Use work trials or test projects as part of the interview process
- Don't just look at resumes — Wade uses AI tools like Grok to find talent outside traditional recruiting channels
- Hire customer-focused, empathetic people — then require everyone to spend time in customer-facing roles

Managing remote teams effectively:
- **Clear expectations**: Define what success looks like for every role and project
- **Outcome-based evaluation**: Measure results, not hours worked or time logged
- **Regular 1-on-1s**: Even in async-first cultures, synchronous check-ins matter for relationship building
- **Visibility without surveillance**: Make work visible through shared dashboards and updates, not tracking software
- **Communicate the vision**: Ensure all teams understand the company direction and how their work contributes

"The key to remote management isn't more meetings or more monitoring," Wade says. "It's creating systems where people have the information they need, the autonomy to act on it, and the accountability to deliver results."

Common mistakes in remote management:
- Trying to replicate office norms (9-to-5 hours, constant availability)
- Over-meeting to compensate for lack of physical presence
- Not investing enough in written documentation
- Assuming culture happens naturally — it requires intentional effort in remote settings`,
  },

  // ============================
  // ZAPIER GROWTH
  // ============================
  {
    title: "Product-Led Growth: The Zapier Way",
    topic: "growth",
    sourceType: "interview",
    content: `# Product-Led Growth: The Zapier Way

Zapier's growth story is one of the most impressive examples of product-led growth (PLG) in tech. Wade Foster built a multi-billion dollar company primarily through a self-serve model with minimal external funding.

Key PLG principles from Zapier:
- **Self-serve onboarding**: Users can sign up, explore, and get value without talking to anyone
- **Free tier as acquisition**: Zapier's free plan introduces users to automation, creating a natural upgrade path
- **Network effects**: Every new integration makes Zapier more valuable for all users
- **Content marketing**: Zapier invested heavily in educational content — blog posts, guides, and tutorials that rank well in search
- **Partner ecosystem**: Encouraging app developers to build Zapier integrations creates a virtuous cycle

"We never had a traditional sales team in the early days," Wade explains. "The product sold itself because it solved a real problem. Our job was to make sure people could discover it, try it, and succeed with it on their own."

Growth milestones:
- Profitable within 3 years
- Grew to serve millions of users worldwide
- Reached $5 billion valuation with only ~$1.3M in outside funding
- Average customer tells others about Zapier — strong word-of-mouth growth

Wade's advice for PLG founders:
1. Make the time-to-value as short as possible — users should see results in minutes, not days
2. Invest in documentation and tutorials — your best "sales reps" are great docs
3. Build for the self-serve user first, enterprise later
4. Use your own product religiously — "dogfooding" reveals friction that data alone can't
5. Let happy customers be your marketing — invest in making customers successful`,
  },
  {
    title: "Content Marketing and SEO as Growth Engines",
    topic: "growth",
    sourceType: "blog",
    content: `# Content Marketing and SEO as Growth Engines

Zapier's content marketing strategy has been a cornerstone of its growth, and Wade Foster has been vocal about how they approached it.

Zapier's content strategy:
- **Integration pages as SEO content**: Each app integration page doubles as a landing page, capturing long-tail search traffic like "connect Slack to Google Sheets"
- **Educational blog**: Thousands of articles on productivity, automation, and app workflows
- **"Best apps" listicles**: Guides like "Best project management tools" rank highly and introduce users to Zapier as the glue between apps
- **Partner co-marketing**: Collaborating with integration partners on content amplifies reach
- **Learning resources**: Zapier University and investment in helping users get more from automation

"Content was our unfair advantage early on," Wade notes. "We were writing about how to connect apps together before most people even knew it was possible. That gave us incredible SEO positioning."

Why content works for PLG:
- People search for solutions to problems, not for products — content meets them where they are
- High-quality content builds trust before someone ever tries the product
- SEO compounds over time — a blog post written in 2015 can still drive signups today
- Content educates users on automation, expanding the total addressable market

Wade's advice for founders:
- Write content that genuinely helps people, not thinly veiled product pitches
- Invest in content early — it takes months to build SEO momentum
- Track which content drives signups and double down on what works
- Don't outsource content strategy — founders should be involved in shaping the narrative early on`,
  },
  {
    title: "Why Even Bootstrapped Startups Should Pay",
    topic: "growth",
    sourceType: "blog",
    content: `# Why Even Bootstrapped Startups Should Pay

Wade Foster authored a notable blog post arguing that even bootstrapped startups should be willing to spend money strategically. This challenges the common bootstrapper mentality of minimizing all costs.

Wade's argument:
- Being bootstrapped doesn't mean being cheap — it means being strategic about spending
- Paying for tools, freelancers, and services can provide competitive advantages
- Time is your most valuable resource as a founder — spend money to save time
- Free tools often have hidden costs in terms of limitations, time spent on workarounds, or lack of reliability
- "If a $50/month tool saves you 10 hours, that's an incredible ROI"

Strategic spending areas for bootstrapped startups:
1. **Developer tools**: Pay for CI/CD, hosting, and monitoring that saves engineering time
2. **Design resources**: Hire freelance designers for key pages instead of DIYing everything
3. **Automation tools**: Obviously Zapier, but also paid integrations and services
4. **Customer support tools**: Professional support software from day one
5. **Legal and accounting**: Don't cut corners on compliance

"The bootstrapper mentality can become a trap if you take it too far," Wade warns. "I've seen founders waste days trying to build something they could have bought for $20/month. That's not frugal — that's bad economics."

The key is ROI thinking: every expenditure should be evaluated based on whether it accelerates growth or saves meaningful time. If it does, the fact that you're bootstrapped is no reason not to spend.`,
  },

  // ============================
  // FUTURE OF WORK
  // ============================
  {
    title: "The Future of Work in an AI World",
    topic: "ai",
    sourceType: "podcast",
    content: `# The Future of Work in an AI World

Wade Foster has thought deeply about how AI will reshape the nature of work, and his perspectives come from running a company at the intersection of automation and AI.

Key predictions and observations:
- **New skills will emerge**: AI fluency will be as fundamental as computer literacy — every knowledge worker will need it
- **Job roles will transform**: Many jobs won't disappear, but the nature of what people do in those jobs will change dramatically
- **Productivity will leap**: AI enables businesses to tackle tasks previously deemed economically unfeasible
- **Smaller teams will compete with large ones**: AI gives small teams the capability that used to require large organizations
- **The value of creativity increases**: As routine tasks get automated, human creativity, judgment, and empathy become more valuable

"AI isn't going to take everyone's job," Wade says, "but it is going to change what everyone's job looks like. The people who will thrive are the ones who learn to work alongside AI effectively."

How Wade sees the transition:
1. **Near-term (now)**: Companies adopt AI for specific tasks — email, code review, content generation
2. **Medium-term (2-3 years)**: Agentic workflows become standard — AI handles entire process chains with human oversight
3. **Long-term (5+ years)**: The nature of companies changes — smaller teams with AI do what large teams did before

Wade's advice for individuals:
- Learn to use AI tools now — don't wait for them to be "ready"
- Focus on skills that complement AI: communication, leadership, creative problem-solving
- Experiment constantly — the landscape is changing so fast that yesterday's best practices are already outdated
- "The fear of AI fades once you actually use it" — just start somewhere

For companies:
- Create space for AI experimentation (hackathons, dedicated time, internal sharing)
- Update hiring practices to value AI fluency
- Redesign workflows to leverage AI, don't just bolt it on to existing processes
- Build feedback loops so AI systems improve over time`,
  },
];
