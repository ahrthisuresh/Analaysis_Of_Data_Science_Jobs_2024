import pandas as pd

def load_and_preprocess_data(file_path='../data/dashboard_cleaned_data.csv'):
    """
    Loads the cleaned CSV file and performs additional preprocessing to ensure
    the data is in the right format for the dashboards.
    """
    # Load the CSV file
    df = pd.read_csv(file_path)
    
    # --- Enforce correct data types ---
    # Convert posting_date to datetime (if present)
    if 'posting_date' in df.columns:
        df['posting_date'] = pd.to_datetime(df['posting_date'], errors='coerce')
    
    # --- Standardize text fields ---
    # For skills, remove extra spaces in the comma-separated string
    if 'skill' in df.columns:
        df['skill'] = df['skill'].apply(
            lambda x: ','.join([skill.strip() for skill in x.split(',')]) if isinstance(x, str) else x
        )
    
    # --- Filter out incomplete records ---
    # Drop rows where essential columns (like location) are missing
    df = df.dropna(subset=['location'])
    
    return df

def export_skill_data(df, output_file='../data/skill_demand_data.json'):
    """
    Processes the skills column to count occurrences and exports the data as JSON.
    """
    # Split the comma-separated skills into individual entries
    all_skills = df['skill'].str.split(',').explode().str.strip()
    skill_counts = all_skills.value_counts().reset_index()
    skill_counts.columns = ['skill', 'count']
    skill_counts.to_json(output_file, orient='records')

def export_location_data(df, output_file='../data/location_data.csv'):
    """
    Exports the fields required for the location explorer dashboard.
    Since there is no salary column, this export focuses on job count by location.
    """
    # Export the fields needed for mapping
    df[['location', 'industry', 'level']].to_csv(output_file, index=False)

def export_industry_trends(df, trends_file='../data/industry_trends_data.csv', employers_file='../data/top_employers.json'):
    """
    Exports industry trends and top employer data based on job posting counts.
    """
    # Group by industry to get job counts per industry.
    trends = df.groupby('industry').size().reset_index(name='counts')
    trends.to_csv(trends_file, index=False)
    
    # Export top employers based on job posting count
    employer_counts = df['company'].value_counts().reset_index()
    employer_counts.columns = ['company', 'job_count']
    top_employers = employer_counts.head(10)
    top_employers.to_json(employers_file, orient='records')

def export_job_trends_over_time(df, output_file='../data/job_trend_over_time.csv'):
    """
    Exports weekly job counts for trend over time visualization.
    """
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])
        daily_counts = df.groupby('date').size().reset_index(name='count')
        daily_counts.to_csv(output_file, index=False)
    else:
        print("No 'date' column found for time-based trend export.")


if __name__ == "__main__":
    # Run preprocessing and export data files for the dashboards.
    df = load_and_preprocess_data('../data/dashboard_cleaned_data.csv')
    export_skill_data(df)
    export_location_data(df)
    export_industry_trends(df)
    export_job_trends_over_time(df)
    print("Preprocessing and export completed!")
