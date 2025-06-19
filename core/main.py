import os
import json
from typing import Any
from langchain_community.utilities.sql_database import SQLDatabase
from langchain_community.chat_models import ChatOllama
from langchain_experimental.sql import SQLDatabaseChain
from langchain.chains.sql_database.prompt import PROMPT
from sqlalchemy import create_engine
from sqlalchemy import text

API_BASE_URL = "https://sample-iot.zackcheng.com"
API_DEVICE_ENDPOINT = "/devices"
API_TELEMETRY_ENDPOINT = "/telemetry"
DB_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "db_config.json")

class PostgresDB(SQLDatabase):
    def __init__(self, user, password, host, port, database):
        db_url = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        engine = create_engine(db_url)
        super().__init__(engine)
        self.engine = engine

    def execute_query(self, sql_query):
        try:
            # print("Executing query:", sql_query)
            with self.engine.connect() as connection:
                result = connection.execute(text(sql_query))
                rows = result.fetchall()
                column_names = result.keys()
                return [dict(zip(column_names, row)) for row in rows]
        except Exception as e:
            print("❌ Query execution failed:", e)
            return {"error": str(e)}

    def get_schema(self):
        return """
        CREATE TABLE device (
            id SERIAL PRIMARY KEY,
            device_type_id INTEGER NOT NULL REFERENCES device_type(id)
        );

        CREATE TABLE device_telemetry (
            id SERIAL PRIMARY KEY,
            device_id INTEGER NOT NULL REFERENCES device(id),
            telemetry_type_id INTEGER NOT NULL REFERENCES telemetry_type(id)
        );

        CREATE TABLE device_type (
            id SERIAL PRIMARY KEY,
            device_type_name VARCHAR(255) NOT NULL UNIQUE
        );

        CREATE TABLE simulated_telemetry (
            id SERIAL PRIMARY KEY,
            time_of_day TIMESTAMP WITHOUT TIME ZONE NOT NULL,
            telemetry_value NUMERIC(10, 3) NOT NULL,
            device_telemetry_id INTEGER NOT NULL REFERENCES device_telemetry(id)
        );

        CREATE TABLE telemetry_type (
            id SERIAL PRIMARY KEY,
            telemetry_type_name VARCHAR(255) NOT NULL UNIQUE
        );
        """

class SQLAgent:
    def __init__(self, db: PostgresDB, llm: ChatOllama):
        schema_guidance = """
            You are a SQL expert. Output ONLY the raw SQL query with no additional text, explanations, or formatting.

            CRITICAL OUTPUT RULES:
            - Output only the SQL query (no explanations, comments, or formatting)
            - Do NOT use markdown code blocks (no ```), backticks (`), or unnecessary quotes
            - Do NOT use table aliases unless explicitly instructed

            SCHEMA (Exact table and column names):
            Tables and their columns:
            - device: id, device_type_id
            - device_type: id, device_type_name  
            - device_telemetry: id, device_id, telemetry_type_id
            - telemetry_type: id, telemetry_type_name
            - simulated_telemetry: id, time_of_day, telemetry_value, device_telemetry_id

            FOREIGN KEYS (Table relationships):
            - device.device_type_id references device_type.id
            - device_telemetry.device_id references device.id
            - device_telemetry.telemetry_type_id references telemetry_type.id
            - simulated_telemetry.device_telemetry_id references device_telemetry.id
            
            VALID TELEMETRY TYPES (for `telemetry_type_name` column):
            - Temperature
            - Power_Generated
            - Luminous_Efficacy
            - Voltage
            - Power_Consumed

            STRICT RULES:
            - You MUST include the following JOINs in every SQL query you generate, even if the columns they expose are not explicitly selected:
                - JOIN device_type ON device.device_type_id = device_type.id
                - JOIN telemetry_type ON device_telemetry.telemetry_type_id = telemetry_type.id
                - JOIN simulated_telemetry ON device_telemetry.id = simulated_telemetry.device_telemetry_id
            - Only include a LIMIT clause if the user explicitly requests a number of results (e.g., "top 3", "first 10", "show 5").

            Your output should be a single valid SQL query that respects all the above constraints.
            """
        self.db = db
        self.summarizer = llm
        custom_prompt = PROMPT.partial(
            dialect="PostgreSQL"
        ).model_copy(update={
            "template": schema_guidance + "\n" + PROMPT.template.replace("```sql\n{query}```", "{query}")
        })
        self.db_chain = SQLDatabaseChain.from_llm(
            llm,
            db,
            verbose=True,
            return_intermediate_steps=True,
            prompt=custom_prompt,
            top_k=10000
        )

    def execute_nl_query(self, natural_language_query):
        try:
            response = self.db_chain.invoke(natural_language_query)
            steps = response.get("intermediate_steps", [])
            # for i, step in enumerate(response["intermediate_steps"]):
            #     print(f"\n🔹 Step {i + 1}:")
            #     print(step)

            sql_query = None
            sql_result = None
            for step in steps:
                if isinstance(step, str) and "SELECT" in step.upper():
                    sql_query = step.strip()
                    break
                elif isinstance(step, dict):
                    for val in step.values():
                        if isinstance(val, str) and "SELECT" in val.upper():
                            sql_query = val.strip()
                            break

            # print("********SQL Query :", sql_query)
            sql_result = self.db.execute_query(sql_query)
            # print("********SQL Result :", sql_result)
            final_answer = self.summarize_result(natural_language_query, sql_result)

            return {
                "query": sql_query,
                "result": sql_result,
                "answer": final_answer
            }

        except Exception as e:
            print("❌ Failed to process query:", str(e))
            return {
                "answer": "Please try another question.",
                "error": f"Failed to process query: {str(e)}"
            }
        
    def summarize_result(self, question: str, result: Any) -> str:
        summary_system_prompt = """
        You are a helpful assistant that summarizes SQL query results into clear, concise answers.
        Always ensure the summary directly addresses the user's question, focusing only on the most relevant information.
        If the query returns multiple rows but the question implies a single result, prioritize the top or most significant item.
        Avoid repeating the entire table or verbose details. Also note that a device is defined by it's ID, not by its type.
        """
        try:
            prompt = [
                {"role": "system","content": summary_system_prompt},
                {"role": "user", "content": f"Question: {question}\nResult:\n{result}"}
            ]
            response = self.summarizer.invoke(prompt)
            return response.content.strip()
        except Exception as e:
            return f"(Failed to summarize result: {str(e)})"

with open(DB_CONFIG_PATH) as config:
    db_config = json.load(config)
postgres = PostgresDB(
    user=db_config["user"],
    password=db_config["password"],
    host=db_config["host"],
    port=db_config["port"],
    database=db_config["database"]
)
mistralOllama = ChatOllama(
    model='mistral:latest',
    url="http://localhost:11434/api/chat",
    temperature=0.0
)
agent = SQLAgent(postgres, mistralOllama)

def main():
    # schema = postgres.get_schema()
    # print(f"Database Schema: {schema}")

    # question = "which device uses the most electricity?"
    question = "which device generates the most electricity?"
    # question = "give me the top 3 devices that has the highest voltage readings"
    # question = "give me the top 3 devices that generates the most electricity"

    print(f"Question: {question}")

    answer = agent.execute_nl_query(question)["answer"]
    print(f"Answer: {answer}")

if __name__ == "__main__":
    main()
