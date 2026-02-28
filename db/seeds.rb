puts "Seeding database..."

# Regions
wallonie = Region.find_or_create_by!(code: "WAL") do |r|
  r.name = "Wallonie"
  r.country = "BE"
end

flandre = Region.find_or_create_by!(code: "VLA") do |r|
  r.name = "Flandre"
  r.country = "BE"
end

bruxelles = Region.find_or_create_by!(code: "BXL") do |r|
  r.name = "Bruxelles-Capitale"
  r.country = "BE"
end

# Villages pilotes (Wallonie)
villages_data = [
  { name: "Modave", code_postal: "4577", region: wallonie, latitude: 50.4451, longitude: 5.2917, population: 4000 },
  { name: "Ohey", code_postal: "5350", region: wallonie, latitude: 50.4333, longitude: 5.1167, population: 5000 },
  { name: "Gesves", code_postal: "5340", region: wallonie, latitude: 50.4000, longitude: 5.0833, population: 7000 },
  { name: "Assesse", code_postal: "5330", region: wallonie, latitude: 50.3667, longitude: 5.0167, population: 7000 },
  { name: "Havelange", code_postal: "5370", region: wallonie, latitude: 50.3833, longitude: 5.2333, population: 5000 },
  { name: "Clavier", code_postal: "4560", region: wallonie, latitude: 50.3833, longitude: 5.3667, population: 4500 },
  { name: "Tinlot", code_postal: "4557", region: wallonie, latitude: 50.4667, longitude: 5.3667, population: 2800 },
  { name: "Marchin", code_postal: "4570", region: wallonie, latitude: 50.4667, longitude: 5.2500, population: 5500 },
  { name: "Anthisnes", code_postal: "4160", region: wallonie, latitude: 50.4833, longitude: 5.5167, population: 4200 },
  { name: "Somme-Leuze", code_postal: "5377", region: wallonie, latitude: 50.3500, longitude: 5.2833, population: 5700 },
]

villages = villages_data.map do |data|
  Village.find_or_create_by!(name: data[:name], code_postal: data[:code_postal]) do |v|
    v.region = data[:region]
    v.latitude = data[:latitude]
    v.longitude = data[:longitude]
    v.population = data[:population]
    v.hectares_potential = rand(50..200).to_f
  end
end

puts "Created #{Village.count} villages"

# Badges MVP (3 badges as per PRD)
badges_data = [
  { name: "Explorateur", slug: "explorateur", description: "A validé 10 spots", icon: "search", criteria_type: "spots_validated", criteria_count: 10 },
  { name: "Cartographe", slug: "cartographe", description: "A ajouté 25 spots", icon: "map", criteria_type: "spots_created", criteria_count: 25 },
  { name: "Photographe", slug: "photographe", description: "A ajouté 20 photos", icon: "camera", criteria_type: "photos_added", criteria_count: 20 },
]

badges_data.each do |data|
  Badge.find_or_create_by!(slug: data[:slug]) do |b|
    b.name = data[:name]
    b.description = data[:description]
    b.icon = data[:icon]
    b.criteria_type = data[:criteria_type]
    b.criteria_count = data[:criteria_count]
  end
end

puts "Created #{Badge.count} badges"

# Demo admin user
admin = User.find_or_create_by!(email: "admin@villages-nourriciers.be") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.display_name = "Admin VN"
  u.role = "admin"
  u.village = villages.first
end

# Demo users
demo_users = [
  { email: "marie@example.com", display_name: "Marie D.", role: "membre", village: villages[0] },
  { email: "thomas@example.com", display_name: "Thomas L.", role: "planteur", village: villages[1] },
  { email: "francoise@example.com", display_name: "Françoise M.", role: "membre", village: villages[0] },
]

demo_users.each do |data|
  User.find_or_create_by!(email: data[:email]) do |u|
    u.password = "password123"
    u.password_confirmation = "password123"
    u.display_name = data[:display_name]
    u.role = data[:role]
    u.village = data[:village]
  end
end

puts "Created #{User.count} users"

# Demo spots
spot_types = %w[haie_existante haie_potentielle arbre_isole bosquet zone_potentielle]
statuses = %w[soumis validé]

villages.first(5).each do |village|
  rand(5..15).times do
    lat_offset = (rand - 0.5) * 0.02
    lng_offset = (rand - 0.5) * 0.02
    type = spot_types.sample
    geom = type.include?("haie") ? "line" : (type == "arbre_isole" ? "point" : "polygon")

    Spot.create!(
      spot_type: type,
      geometry_type: geom,
      latitude: village.latitude + lat_offset,
      longitude: village.longitude + lng_offset,
      status: statuses.sample,
      village: village,
      creator: User.order("RANDOM()").first,
      species: ["Charme", "Hêtre", "Aubépine", "Prunellier", "Noisetier", "Pommier", "Poirier", "Noyer"].sample,
      estimated_height: rand(1.0..15.0).round(1),
      is_edible: [true, false].sample,
      description: "Spot identifié par un citoyen",
      source: ["citizen", "lidar"].sample,
      opportunity_score: rand(0.3..1.0).round(2),
      positive_validations: rand(0..3)
    )
  end
end

puts "Created #{Spot.count} spots"
puts "Seeding complete!"
