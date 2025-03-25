import pandas as pd

# Load the dataset
df = pd.read_csv("gender-pay-gap-dataset-original.csv")

# List of occupation columns (assuming these are one-hot encoded)
occupation_columns = [
    "Agriculture", "miningconstruction", "durables", "nondurables", "Transport",
    "Utilities", "Communications", "retailtrade", "wholesaletrade", "finance",
    "SocArtOther", "hotelsrestaurants", "Medical", "Education", "professional",
    "publicadmin", "sumadj_ind", "manager", "business", "financialop", "computer",
    "architect", "scientist", "socialworker", "postseceduc", "legaleduc", "artist",
    "lawyerphysician", "healthcare", "healthsupport", "protective", "foodcare",
    "building", "sales", "officeadmin", "farmer", "constructextractinstall",
    "production", "transport"
]

# Convert one-hot encoding to a single "Occupation" column
df['Occupation'] = df[occupation_columns].idxmax(axis=1)

# Drop the original one-hot encoded columns
df = df.drop(columns=occupation_columns)

# Mapping categorical values
df['sex'] = df['sex'].replace({1: 'Male', 2: 'Female'})
df['race'] = df['race'].replace({
    1: 'White Non-Hispanic',
    2: 'Black Non-Hispanic',
    3: 'Hispanic',
    4: 'Other Non-Hispanic'
})
df['Education'] = df['sch'].replace({
    0: 'None',
    1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5',
    6: 'Grade 6', 7: 'Grade 7', 8: 'Grade 8', 9: 'Grade 9', 10: 'Grade 10',
    11: 'Grade 11', 12: 'Grade 12', 13: 'Some College', 14: 'Associate',
    16: 'Bachelor’s', 18: 'Advanced Degree'
})

# Drop the original 'sch' column
df = df.drop(columns=['sch'])

# Save the modified DataFrame to a new CSV file
df.to_csv("gender-pay-gap-dataset-modified.csv", index=False)

print("File saved successfully as 'gender-pay-gap-dataset-modified.csv'.")
