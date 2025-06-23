from setuptools import setup, find_packages

setup(
    name="insighthub",
    version="0.1.0",
    packages=find_packages(include=["insighthub", "insighthub.*"]),
    python_requires=">=3.8",
    install_requires=[],
    author="Zack Cheng",
    description="InsightHub core Python logic"
)