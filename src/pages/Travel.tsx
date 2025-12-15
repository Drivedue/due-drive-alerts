import { useState } from "react";
import MobileLayout from "@/components/MobileLayout";
import { 
  Plane, Bell, User, ArrowLeftRight, Calendar, Users, Search,
  UmbrellaIcon, Landmark, Building, MapPin, Plus,
  Wifi, Utensils, Luggage, Check, Filter, ArrowUpDown, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Travel = () => {
  const [activeTab, setActiveTab] = useState("Flights");
  const [fromLocation, setFromLocation] = useState("Lagos (LOS)");
  const [toLocation, setToLocation] = useState("London (LHR)");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const searchTabs = ["Flights", "Hotels", "Cars", "Packages"];

  const destinations = [
    { name: "Dubai", price: "₦350,000", icon: UmbrellaIcon, gradient: "from-rose-400 to-rose-200" },
    { name: "New York", price: "₦420,000", icon: Landmark, gradient: "from-blue-400 to-blue-200" },
    { name: "Tokyo", price: "₦510,000", icon: Building, gradient: "from-orange-300 to-orange-100" },
    { name: "Paris", price: "₦380,000", icon: Landmark, gradient: "from-green-400 to-cyan-300" },
    { name: "Nairobi", price: "₦180,000", icon: MapPin, gradient: "from-lime-400 to-green-300" },
    { name: "Singapore", price: "₦450,000", icon: Building, gradient: "from-pink-300 to-purple-200" },
    { name: "Cape Town", price: "₦220,000", icon: MapPin, gradient: "from-blue-300 to-indigo-400" },
    { name: "View All", price: "", icon: Plus, gradient: "from-red-400 to-pink-400" },
  ];

  const offers = [
    {
      title: "Summer Getaway Sale",
      desc: "Book flights to Europe and get 25% off on selected routes.",
      tag: "-25%",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80"
    },
    {
      title: "Business Class Upgrade",
      desc: "Upgrade to business class for only 50% more on international flights.",
      tag: "Business",
      image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80"
    },
    {
      title: "Family Vacation Package",
      desc: "Special rates for family bookings. Kids under 12 fly at 60% discount.",
      tag: "Family",
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
    }
  ];

  const flights = [
    { id: 1, airline: "British Airways", code: "BA", flightNo: "BA075", departure: "08:45", arrival: "14:20", duration: "6h 35m", stops: "Non-stop", price: "₦425,800" },
    { id: 2, airline: "Virgin Atlantic", code: "VS", flightNo: "VS411", departure: "11:30", arrival: "17:45", duration: "7h 15m", stops: "Non-stop", price: "₦410,500" },
    { id: 3, airline: "Air France", code: "AF", flightNo: "AF547", departure: "15:20", arrival: "22:10", duration: "6h 50m", stops: "1 stop (CDG)", price: "₦398,200" },
    { id: 4, airline: "Turkish Airlines", code: "TK", flightNo: "TK619", departure: "02:15", arrival: "13:40", duration: "11h 25m", stops: "1 stop (IST)", price: "₦375,900" },
  ];

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowResults(true);
      toast.success("Sabre API: Flight search completed successfully");
    }, 1500);
  };

  const handleBookFlight = (flight: typeof flights[0]) => {
    toast.info(`Starting booking for ${flight.airline} ${flight.flightNo}`);
    setTimeout(() => {
      toast.success("Sabre API: Booking confirmed! PNR: SA8H4J");
    }, 2000);
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <header className="bg-gradient-to-br from-[hsl(210,65%,28%)] to-[hsl(205,70%,42%)] text-white px-5 pt-5 pb-8 rounded-b-[25px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 font-bold text-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <span>DriveDue</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">3</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search Container */}
          <div className="bg-card rounded-2xl p-4 shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
              {searchTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-center py-2 text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Form */}
            <div className="space-y-3">
              <div className="flex items-center bg-muted rounded-xl px-4 py-3">
                <Plane className="w-5 h-5 text-primary mr-3" />
                <Input
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="From"
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwap}
                  className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all hover:rotate-180 duration-300"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center bg-muted rounded-xl px-4 py-3">
                <Plane className="w-5 h-5 text-primary mr-3 rotate-90" />
                <Input
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="To"
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex items-center bg-muted rounded-xl px-4 py-3">
                  <Calendar className="w-5 h-5 text-primary mr-3" />
                  <Input
                    defaultValue="June 15, 2025"
                    placeholder="Departure"
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                </div>
                <div className="flex-1 flex items-center bg-muted rounded-xl px-4 py-3">
                  <Users className="w-5 h-5 text-primary mr-3" />
                  <Input
                    defaultValue="1 Adult"
                    placeholder="Passengers"
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-[hsl(210,65%,28%)] to-[hsl(205,70%,42%)] hover:opacity-90 py-6 text-base"
              >
                {isSearching ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                {isSearching ? "Searching..." : `Search ${activeTab}`}
              </Button>
            </div>
          </div>
        </header>

        <main className="p-5 space-y-6">
          {/* API Status */}
          <div className="bg-card rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-foreground">Connected to Sabre GDS</span>
            </div>
            <span className="font-bold text-primary text-sm">SABRE API</span>
          </div>

          {/* Flight Results */}
          {showResults && (
            <section className="bg-card rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{fromLocation.split(" ")[0]} → {toLocation.split(" ")[0]}</h3>
                  <p className="text-sm text-muted-foreground">June 15, 2025 • 1 Adult, Economy</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <ArrowUpDown className="w-3 h-3 mr-1" /> Sort
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Filter className="w-3 h-3 mr-1" /> Filter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {flights.map((flight) => (
                  <div key={flight.id} className="border border-border rounded-xl p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Plane className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-primary">{flight.airline}</p>
                          <p className="text-xs text-muted-foreground">Economy • {flight.flightNo}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-primary">{flight.price}</p>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{flight.departure}</p>
                        <p className="text-xs text-muted-foreground">LOS</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{flight.duration}</p>
                        <p className="text-xs text-red-500">{flight.stops}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{flight.arrival}</p>
                        <p className="text-xs text-muted-foreground">LHR</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <div className="flex gap-3">
                        {[Utensils, Wifi, Luggage].map((Icon, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-green-500" />
                            <Icon className="w-3 h-3" />
                          </div>
                        ))}
                      </div>
                      <Button size="sm" onClick={() => handleBookFlight(flight)}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Powered by Sabre GDS - Real-time flight availability
              </p>
            </section>
          )}

          {/* Popular Destinations */}
          <section className="bg-card rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-4">Popular Destinations</h2>
            <div className="grid grid-cols-4 gap-3">
              {destinations.map((dest, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (dest.name !== "View All") {
                      setToLocation(dest.name);
                      toast.info(`Selected ${dest.name}`);
                    }
                  }}
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-muted transition-all hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${dest.gradient} flex items-center justify-center mb-2 shadow-md`}>
                    <dest.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{dest.name}</p>
                  {dest.price && <p className="text-[10px] text-primary font-semibold mt-1">{dest.price}</p>}
                </button>
              ))}
            </div>
          </section>

          {/* Special Offers */}
          <section className="bg-card rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">Special Offers</h2>
              <a href="#" className="text-sm text-primary font-medium">See All</a>
            </div>

            <div className="overflow-hidden rounded-xl">
              <div 
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {offers.map((offer, idx) => (
                  <div key={idx} className="min-w-full">
                    <div 
                      className="h-44 bg-cover bg-center rounded-t-xl relative"
                      style={{ backgroundImage: `url(${offer.image})` }}
                    >
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        {offer.tag}
                      </span>
                    </div>
                    <div className="p-4 bg-muted rounded-b-xl">
                      <h3 className="font-semibold text-primary mb-2">{offer.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{offer.desc}</p>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlide === idx ? "bg-primary scale-125" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center py-5 text-xs text-muted-foreground border-t border-border bg-card">
          <p>DriveDue Travel • Sabre GDS Integrated</p>
          <p>© 2025 DriveDue. All rights reserved.</p>
        </footer>
      </div>
    </MobileLayout>
  );
};

export default Travel;
