import os
import pyarrow.parquet as pq
import pandas as pd
import json
import math


def process_data(file_path):
    # file_path = "raw_data/yellow_tripdata_2022-01.parquet"
    trips = pq.read_table(file_path)
    trips = trips.to_pandas()
    # Drop datetime columns as per request
    trips = trips.drop(columns=['tpep_pickup_datetime', 'tpep_dropoff_datetime', 'VendorID'])

    # Group by PULocationID and DOLocationID, and summarize numeric columns
    summary_df = trips.groupby(['PULocationID', 'DOLocationID']).agg({
        'passenger_count': ['sum', 'mean'],
        'trip_distance': 'mean',
        'RatecodeID': 'mean',
        'fare_amount': 'mean',
        'extra': 'mean',
        'mta_tax': 'mean',
        'tip_amount': 'mean',
        'tolls_amount': 'mean',
        'improvement_surcharge': 'mean',
        'total_amount': 'mean',
    }).reset_index()

    summary_df.columns = ['PULocationID', 'DOLocationID',
                          'passenger_count_sum', 'passenger_count_mean',
                          'trip_distance', 'RatecodeID', 'fare_amount',
                          'extra', 'mta_tax', 'tip_amount',
                          'tolls_amount', 'improvement_surcharge',
                          'total_amount']

    summary_df = summary_df.fillna(0)
    summary_df = summary_df[summary_df['passenger_count_mean'] != 0]
    summary_df = summary_df[summary_df['PULocationID'] < 263]
    summary_df = summary_df[summary_df['DOLocationID'] < 263]
    data_year_month = file_path.split('_')
    print(data_year_month)
    data_year_month = data_year_month[3].split('.')[0]
    print(data_year_month)

    lookup_df = pd.read_csv("taxi_zones_centroids.csv")

    # Merge with lookup table to get coordinates for PULocationID (Pickup)
    summary_df = summary_df.merge(
        lookup_df, how="left", left_on="PULocationID", right_on="LocationID"
    ).rename(columns={"Longitude": "X_Longitude", "Latitude": "X_Latitude"}).drop(columns=["LocationID"])

    # Merge with lookup table to get coordinates for DOLocationID (Dropoff)
    summary_df = summary_df.merge(
        lookup_df, how="left", left_on="DOLocationID", right_on="LocationID"
    ).rename(columns={"Longitude": "Y_Longitude", "Latitude": "Y_Latitude"}).drop(columns=["LocationID"])

    # get the log of it
    summary_df["width"] = summary_df['passenger_count_sum'].apply(lambda x: math.log10(x))

    # Print the rows where there are NaN values in any of the longitude or latitude columns
    nan_rows = summary_df[summary_df[['X_Longitude', 'X_Latitude', 'Y_Longitude', 'Y_Latitude']].isna().any(axis=1)]

    # Display the rows with NaN values
    print(nan_rows)

    taxi_zone_lookup = pd.read_csv("taxi_zone_lookup.csv")

    # Merge summary_df with taxi_zone_lookup to get Borough and Zone
    summary_df = summary_df.merge(
        taxi_zone_lookup[['LocationID', 'Borough', 'Zone']],
        left_on='PULocationID', right_on='LocationID', how='left'
    ).rename(columns={'Borough': 'PUBorough', 'Zone': 'PUZone'}).drop(columns=['LocationID'])

    summary_df = summary_df.merge(
        taxi_zone_lookup[['LocationID', 'Borough', 'Zone']],
        left_on='DOLocationID', right_on='LocationID', how='left'
    ).rename(columns={'Borough': 'DOBorough', 'Zone': 'DOZone'}).drop(columns=['LocationID'])




    features = []
    for _, row in summary_df.iterrows():
        feature = {
            'type': 'Feature',
            'properties': {
                'color': '#000000',  # Use black for all lines
                'lineThickness': row['width'],  # Use 'width' for line thickness
                'PULocationID': row['PULocationID'],
                'PUBorough': row['PUBorough'],
                'PUZone': row['PUZone'],
                'DOLocationID': row['DOLocationID'],
                'DOBorough': row['DOBorough'],
                'DOZone': row['DOZone'],
                'passenger_count_sum': row['passenger_count_sum'],
                'passenger_count_mean': row['passenger_count_mean'],
                'trip_distance': row['trip_distance'],
                'RatecodeID': row['RatecodeID'],
                'fare_amount': row['fare_amount'],
                'extra': row['extra'],
                'mta_tax': row['mta_tax'],
                'tip_amount': row['tip_amount'],
                'tolls_amount': row['tolls_amount'],
                'improvement_surcharge': row['improvement_surcharge'],
                'total_amount': row['total_amount']
            },
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [row['X_Longitude'], row['X_Latitude']],
                    [row['Y_Longitude'], row['Y_Latitude']]
                ]
            }
        }
        features.append(feature)

    geojson = {
        'type': 'FeatureCollection',
        'features': features
    }

    os.makedirs("output", exist_ok=True)
    # summary_df.to_csv(os.path.join("output", data_year_month) + ".csv")
    with open(os.path.join("output", data_year_month) + ".geojson", "w") as f:
        json.dump(geojson, f, indent=4)


taxi_zones = pd.read_csv("taxi_zone_lookup.csv")


for file in os.listdir("raw_data"):
    if file.endswith(".parquet"):
        process_data(os.path.join("raw_data", file))