from setuptools import setup, find_namespace_packages

def load_requirements(path):
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip() and not line.startswith("#")]

setup(
    name="insighthub-core",
    version="0.1.0",
    packages=find_namespace_packages(include=["insighthub.*"]),
    python_requires=">=3.8",
    install_requires=load_requirements("requirements.txt"),
    author="Zack Cheng",
    description="InsightHub core Python logic"
)
