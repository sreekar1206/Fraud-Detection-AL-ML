# Contributing to Fraud-Detection-AL-ML

This project detects fraudulent behaviour in online banking transactions using anomaly detection and supervised learning. Contributions of all sizes are welcome.

## Data rules

Never commit real transaction data, card numbers, account identifiers, or customer names. Use the public benchmark datasets referenced in the README, or generate synthetic transactions. Keep large data files out of git and load them from a local data directory that is ignored.

## Getting started

Fork the repository and clone your fork. Install the backend and frontend dependencies as described in the README, then work on a branch named after the change, for example feat/isolation-forest-baseline.

## Making a change

Keep each pull request focused on one concern. When you change a model or a feature pipeline, report the metrics before and after on the same split, and say which split you used. Precision, recall and the false positive rate matter more than raw accuracy here, since the classes are heavily imbalanced. Document any new hyperparameter and its default.

## Reporting issues

Include the steps to reproduce, the dataset or synthetic generator you used, the expected result, and what you observed, along with your Python and OS versions. For suspected false positives, describe the transaction pattern rather than sharing raw records.
