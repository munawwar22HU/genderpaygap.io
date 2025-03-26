import pandas as pd

# Load the dataset
df = pd.read_csv("gender-pay-gap-dataset_2.csv")
print(df.columns)

df['ft_status'] = df['ft'].replace({1: 'Full Time', 0: 'Part Time'})  # Assuming 'ft' is 1 for full-time

# Drop the original 'ft' column
df = df.drop(columns=['ft'])

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

# Mapping of original occupation columns to commonly used occupation names
occupation_mapping = {
    "Agriculture": "Agriculture",
    "miningconstruction": "Mining and Construction",
    "durables": "Durable Goods",
    "nondurables": "Non-Durable Goods",
    "Transport": "Transportation",
    "Utilities": "Utilities",
    "Communications": "Telecommunications",
    "retailtrade": "Retail",
    "wholesaletrade": "Wholesale",
    "finance": "Finance",
    "SocArtOther": "Social Services",
    "hotelsrestaurants": "Hospitality",
    "Medical": "Healthcare",
    "Education": "Education",
    "professional": "Professional Services",
    "publicadmin": "Public Administration",
    "sumadj_ind": "Industry",
    "manager": "Management",
    "business": "Business",
    "financialop": "Finance Operations",
    "computer": "Information Technology",
    "architect": "Architecture",
    "scientist": "Science",
    "socialworker": "Social Work",
    "postseceduc": "Higher Education",
    "legaleduc": "Law",
    "artist": "Art",
    "lawyerphysician": "Lawyer/Physician",
    "healthcare": "Healthcare",
    "healthsupport": "Health Support",
    "protective": "Public Safety",
    "foodcare": "Food Service",
    "building": "Construction",
    "sales": "Sales",
    "officeadmin": "Administrative Support",
    "farmer": "Farming",
    "constructextractinstall": "Construction and Installation",
    "production": "Manufacturing",
    "transport": "Transport"
}


# Convert one-hot encoding to a single "Occupation" column
df['Occupation'] = df[occupation_columns].idxmax(axis=1)
df['Occupation'] = df['Occupation'].map(occupation_mapping)
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
    16: 'Bachelors', 18: 'Advanced Degree', 2.5: 'Grade 2', 5.5: 'Grade 5',
    7.5: 'Grade 7'
})

# Drop the original 'sch' column
df = df.drop(columns=['sch'])
print(df['Education'].value_counts())



# Save the modified DataFrame to a new CSV file
df.to_csv("../gender-pay-gap-dataset-final.csv", index=False)

print("File saved successfully as 'gender-pay-gap-dataset-modified.csv'.")

import matplotlib.pyplot as plt
import seaborn as sns

plt.figure(figsize=(10, 6))
sns.boxplot(data=df, x='ft_status', y='annhrs', hue='sex', palette='Set2')

# Set plot labels and title
plt.title('Annual Hours Worked by Employment Status and Gender')
plt.xlabel('Employment Status')
plt.ylabel('Annual Hours Worked')
plt.show()
