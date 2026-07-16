const supabase = require("./supabase");

const salonsData = [
    {
        code: "scissors-hub",
        salon: {
            user_id: 1,
            banner_image: "https://thescissorshub.com/wp-content/uploads/2024/12/DSC1076-scaled.jpg",
            category: "A",
            name: "The Scissors Hub",
            email: "contact@thescissorshub.com",
            contact_no: "+91 99999 88888",
            area: "Sector 43, Gurugram",
            description: "The Scissors Hub is a premier unisex salon providing exceptional haircutting, styling, hair texture services, coloring, facials, manicures, pedicures, and makeup rituals. Experience luxury grooming by expert stylists using 100% genuine and authentic products.",
            services: "1,2,3,4,6,10,11,13",
            amenities: "1,2,3,4,6",
            salon_code: "scissors-hub",
            policies: "Appointments highly recommended. Standard cancellation policy applies. Safe and hygienic environment.",
            type: "unisex",
            status: "active",
            is_home: false,
            is_featured: true,
            is_franchise: true,
            is_selfowned: false,
            is_subscribed: true,
            priority: 1,
            occupancy: 20,
            staff_count: 8,
            opening_time: "2026-07-16T04:30:00.000Z", // 10:00 AM IST
            closing_time: "2026-07-16T14:30:00.000Z", // 08:00 PM IST
        },
        address: {
            street: "C-1049, Ground Floor, Vyapar Kendra Rd, Block C, Sushant Lok Phase 1",
            landmark: "Near Vyapar Kendra Market",
            zipcode: "122009",
            latitude: "28.4593",
            longitude: "77.0725",
            state: "Haryana",
            country: 1
        },
        images: [
            { type: "front", image_src: "https://thescissorshub.com/wp-content/uploads/2024/12/DSC1076-scaled.jpg", priority: 10 },
            { type: "last_full_salon", image_src: "https://thescissorshub.com/wp-content/uploads/2024/12/woman-washing-head-hairsalon.jpg", priority: 8 },
            { type: "service_chair", image_src: "https://thescissorshub.com/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-19-at-12.18.46-PM-e1734605241273.jpeg", priority: 6 },
            { type: "reception", image_src: "https://thescissorshub.com/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-19-at-12.18.50-PM-e1734605213115.jpeg", priority: 4 },
            { type: "other_service_customer", image_src: "https://thescissorshub.com/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-19-at-12.18.49-PM.jpeg", priority: 2 }
        ]
    },
    {
        code: "aura-wellness",
        salon: {
            user_id: 1,
            banner_image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
            category: "A",
            name: "Aura Wellness Sanctuary",
            email: "booking@aurawellness.com",
            contact_no: "+91 88888 77777",
            area: "Sushant Lok Phase 1, Gurugram",
            description: "A quiet oasis designed to restore harmony and balance. Aura Wellness Sanctuary offers premium holistic skincare, aromatherapies, express facials, and anti-aging treatments in a serene environment.",
            services: "6,7,8,9,19",
            amenities: "2,3,4,5,6,7,8",
            salon_code: "aura-wellness",
            policies: "No cancellations within 4 hours. Quiet environment requested.",
            type: "female",
            status: "active",
            is_home: false,
            is_featured: true,
            is_franchise: false,
            is_selfowned: true,
            is_subscribed: true,
            priority: 2,
            occupancy: 15,
            staff_count: 5,
            opening_time: "2026-07-16T03:30:00.000Z", // 09:00 AM IST
            closing_time: "2026-07-16T13:30:00.000Z", // 07:00 PM IST
        },
        address: {
            street: "Aura Lane, Block B, Sushant Lok Phase 1",
            landmark: "Opposite Galleria Market",
            zipcode: "122002",
            latitude: "28.4674",
            longitude: "77.0815",
            state: "Haryana",
            country: 1
        },
        images: [
            { type: "front", image_src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop", priority: 10 },
            { type: "last_full_salon", image_src: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop", priority: 8 },
            { type: "facial_bed", image_src: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=1200&auto=format&fit=crop", priority: 6 },
            { type: "reception", image_src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop", priority: 4 }
        ]
    },
    {
        code: "grace-blade",
        salon: {
            user_id: 1,
            banner_image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
            category: "A",
            name: "Grace & Blade Atelier",
            email: "hello@graceandblade.com",
            contact_no: "+91 77777 66666",
            area: "DLF Phase 3, Gurugram",
            description: "A high-end studio redefining modern grooming and styling. Specializing in editorial cuts, advanced hair coloring, keratin treatments, hair extensions, and custom bridal styling by world-class specialists.",
            services: "1,2,3,4,5,13,14",
            amenities: "1,2,3,4,6,7,9",
            salon_code: "grace-blade",
            policies: "Please arrive 10 minutes early. Cancellations must be made 24 hours in advance.",
            type: "unisex",
            status: "active",
            is_home: false,
            is_featured: true,
            is_franchise: false,
            is_selfowned: false,
            is_subscribed: true,
            priority: 3,
            occupancy: 25,
            staff_count: 10,
            opening_time: "2026-07-16T04:30:00.000Z", // 10:00 AM IST
            closing_time: "2026-07-16T15:30:00.000Z", // 09:00 PM IST
        },
        address: {
            street: "Atelier Plaza, DLF Phase 3",
            landmark: "Near Cyber City",
            zipcode: "122010",
            latitude: "28.4905",
            longitude: "77.0898",
            state: "Haryana",
            country: 1
        },
        images: [
            { type: "front", image_src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop", priority: 10 },
            { type: "last_full_salon", image_src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop", priority: 8 },
            { type: "service_chair", image_src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=1200&auto=format&fit=crop", priority: 6 },
            { type: "reception", image_src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1200&auto=format&fit=crop", priority: 4 }
        ]
    }
];

async function seed() {
    try {
        console.log("Seeding dummy salons...");

        // 1. Ensure Gurugram is in the city table
        let { data: gurugramCity, error: cityFindError } = await supabase
            .from("city")
            .select("id")
            .eq("name", "Gurugram")
            .maybeSingle();

        let cityId;
        if (cityFindError) {
            console.error("Error checking Gurugram city:", cityFindError);
        }

        if (!gurugramCity) {
            console.log("Gurugram not found. Inserting it into city table...");
            const { data: newCity, error: cityInsertError } = await supabase
                .from("city")
                .insert({ name: "Gurugram", state_id: "2" }) // State ID 2 is Uttarakhand/UP, we'll map to it
                .select("id")
                .single();

            if (cityInsertError) {
                console.error("Failed to insert Gurugram city, fallback to id 1 (Bareilly):", cityInsertError);
                cityId = "1";
            } else {
                cityId = newCity.id.toString();
                console.log("Gurugram city created with id:", cityId);
            }
        } else {
            cityId = gurugramCity.id.toString();
            console.log("Gurugram city found with id:", cityId);
        }

        for (const data of salonsData) {
            console.log(`Processing salon: ${data.salon.name}`);

            // A. Clean up existing salon if exists
            const { data: existingSalon } = await supabase
                .from("salon")
                .select("id")
                .eq("salon_code", data.code)
                .maybeSingle();

            if (existingSalon) {
                console.log(`Salon ${data.salon.name} already exists (id: ${existingSalon.id}). Cleaning up old records...`);
                
                // Delete address
                await supabase.from("address").delete().eq("parent", "salon").eq("parent_id", existingSalon.id);
                // Delete images
                await supabase.from("images").delete().eq("parent", "salon").eq("parent_id", existingSalon.id);
                // Delete salon
                await supabase.from("salon").delete().eq("id", existingSalon.id);
            }

            // B. Insert salon
            const { data: newSalon, error: salonError } = await supabase
                .from("salon")
                .insert(data.salon)
                .select("id")
                .single();

            if (salonError) {
                console.error(`Error inserting salon ${data.salon.name}:`, salonError);
                continue;
            }

            const salonId = newSalon.id;
            console.log(`Salon ${data.salon.name} inserted with ID: ${salonId}`);

            // C. Insert address
            const addressPayload = {
                ...data.address,
                parent: "salon",
                parent_id: salonId,
                city: cityId
            };
            const { error: addressError } = await supabase
                .from("address")
                .insert(addressPayload);

            if (addressError) {
                console.error(`Error inserting address for ${data.salon.name}:`, addressError);
            } else {
                console.log(`Address inserted for ${data.salon.name}`);
            }

            // D. Insert images
            const imagesPayload = data.images.map(img => ({
                ...img,
                parent: "salon",
                parent_id: salonId
            }));

            const { error: imagesError } = await supabase
                .from("images")
                .insert(imagesPayload);

            if (imagesError) {
                console.error(`Error inserting images for ${data.salon.name}:`, imagesError);
            } else {
                console.log(`Images inserted for ${data.salon.name}`);
            }
        }

        console.log("Seeding completed successfully!");
    } catch (e) {
        console.error("Seeding execution error:", e);
    }
}

seed();
