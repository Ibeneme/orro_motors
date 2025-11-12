// import { useEffect, useState } from "react";
// import axios from "axios";
// import { baseURL } from "../services/baseurl";
// import { useToast } from "../components/Toast/Toast";

// interface Trip {
//   id: string;
//   tripName?: string;
//   departureDateTime?: string;
//   departure: string;
//   arrival: string;
//   duration?: string;
//   price: string;
//   seats: number;
//   pickup: { name: string; address: string };
//   dropoff: { name: string; address: string };
// }

// const useFetchTripsByIds = (tripIds: string[] | null) => {
//   const [trips, setTrips] = useState<Trip[]>([]);
//   const [loading, setLoading] = useState(false);
//   const addToast = useToast();

//   useEffect(() => {
//     if (!tripIds || tripIds.length === 0) return;

//     const fetchTrips = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.post(
//           `${baseURL}/trips/search-trips-by-ids`,
//           {
//             ids: tripIds,
//           }
//         );

//         const fetchedTrips: Trip[] = response.data?.trips || [];

//         if (fetchedTrips.length > 0) {
//           addToast({
//             type: "success",
//             title: "Trips Found!",
//             message: `Found ${fetchedTrips.length} trip(s).`,
//           });
//           setTrips(fetchedTrips);
//         } else {
//           addToast({
//             type: "error",
//             title: "No Trips Found",
//             message: "No trips found for the provided IDs.",
//           });
//         }
//       } catch (err: any) {
//         console.error("❌ Error fetching trips by IDs:", err);
//         addToast({
//           type: "error",
//           title: "Search Failed",
//           message:
//             err.response?.data?.message ||
//             "Unable to fetch trips. Please try again later.",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrips();
//   }, [tripIds, addToast]);

//   return { trips, loading };
// };

// export default useFetchTripsByIds;
