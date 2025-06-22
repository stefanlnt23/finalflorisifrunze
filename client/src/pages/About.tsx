import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layouts/MainLayout";
import { 
  Leaf, 
  Heart, 
  Shield, 
  Users, 
  Award, 
  TreePine,
  Flower2,
  Sprout,
  Sun,
  Scissors,
  Quote,
  CheckCircle,
  Star,
  Clock,
  Target
} from "lucide-react";

export default function About() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const expertiseAreas = [
    {
      icon: <Scissors className="h-8 w-8" />,
      title: "Design Peisagistic",
      description: "Creăm designuri unice și funcționale care reflectă personalitatea fiecărui client",
      color: "text-green-600 bg-green-50"
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Întreținere Grădini",
      description: "Îngrijim fiecare detaliu pentru ca grădina ta să rămână perfectă în orice sezon",
      color: "text-blue-600 bg-blue-50"
    },
    {
      icon: <Flower2 className="h-8 w-8" />,
      title: "Consultanță Horticolă",
      description: "Oferim sfaturi experte pentru alegerea plantelor potrivite climatului local",
      color: "text-purple-600 bg-purple-50"
    },
    {
      icon: <TreePine className="h-8 w-8" />,
      title: "Amenajări Complexe",
      description: "Realizăm proiecte complete de la concept până la implementarea finală",
      color: "text-orange-600 bg-orange-50"
    }
  ];

  const values = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Sustenabilitate",
      description: "Folosim doar practici eco-friendly și produse naturale pentru a proteja mediul înconjurător",
      accent: "text-green-600"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Pasiune",
      description: "Fiecare proiect este abordat cu dragostea și dedicarea pe care le acordăm propriilor noastre grădini",
      accent: "text-rose-600"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Calitate",
      description: "Garantăm rezultate de excepție prin utilizarea celor mai bune materiale și tehnici moderne",
      accent: "text-blue-600"
    }
  ];

  const testimonials = [
    {
      quote: "Echipa Flori și Frunze a transformat complet grădina noastră. Profesionalismul și atenția la detalii sunt remarcabile.",
      author: "Ana Georgescu",
      location: "București"
    },
    {
      quote: "Am ales abonamentul Premium și sunt foarte mulțumită. Grădina arată perfect în fiecare sezon.",
      author: "Radu Marinescu", 
      location: "Ilfov"
    },
    {
      quote: "Recomand cu încredere! Sunt oameni pasionați care știu cu adevărat ce fac.",
      author: "Carmen Stoica",
      location: "Ploiești"
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section with Background Pattern */}
        <section className="relative bg-gradient-to-br from-green-50 via-white to-green-50 py-12 lg:py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 text-green-600 animate-float-garden">
              <Leaf className="h-16 w-16 rotate-12" />
            </div>
            <div className="absolute top-20 right-20 text-green-600 animate-float-garden-delayed">
              <Flower2 className="h-12 w-12 -rotate-12" />
            </div>
            <div className="absolute bottom-20 left-20 text-green-600 animate-float-garden-slow">
              <TreePine className="h-20 w-20 rotate-6" />
            </div>
            <div className="absolute bottom-10 right-10 text-green-600 animate-float-garden">
              <Sprout className="h-14 w-14 -rotate-6" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 animate-rotate-glow">
              <Sun className="h-24 w-24 rotate-45" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-6 py-2 text-sm font-medium">
                Despre Echipa Noastră
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-black text-gray-900 leading-tight">
                Pasiune pentru
                <span className="block text-green-600 relative">
                  Grădinărit
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-green-500 to-green-300 rounded-full"></div>
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                De peste 15 ani transformăm visurile în realitate, creând spații verzi care inspiră și aduc bucurie în fiecare zi.
              </p>

              <div className="flex flex-wrap justify-center gap-6 pt-8">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-green-100">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-700">500+ Proiecte</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-green-100">
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-700">Echipă de 8 specialiști</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border border-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-700">Garanție 2 ani</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section with Better Layout */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Povestea Noastră
                    </Badge>
                    <h2 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
                      Cum a început
                      <span className="block text-green-600">totul</span>
                    </h2>
                  </div>
                  
                  <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                    <p>
                      Povestea Flori și Frunze a început în 2008, când Ion Popescu și-a transformat pasiunea pentru grădinărit într-o misiune: să aducă frumusețea naturii în fiecare curte din România.
                    </p>
                    
                    <p>
                      Ce a început ca un mic atelier de design peisagistic s-a transformat în cea mai de încredere echipă de specialiști în grădinărit din regiunea București-Ilfov.
                    </p>
                    
                    <p>
                      Astăzi, cu o echipă de 8 specialiști pasionați și peste 500 de proiecte finalizate, continuăm să creăm spații verzi care îmbunătățesc calitatea vieții clienților noștri.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                      <div className="text-3xl font-black text-green-600 mb-2">15+</div>
                      <div className="text-sm font-medium text-gray-600">Ani de experiență</div>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="text-3xl font-black text-blue-600 mb-2">98%</div>
                      <div className="text-sm font-medium text-gray-600">Clienți mulțumiți</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Echipa Flori și Frunze la lucru"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-green-100">
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border border-rose-100">
                    <Heart className="h-8 w-8 text-rose-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section with Earth Tones */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-6 mb-16">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  Valorile Noastre
                </Badge>
                <h2 className="text-3xl lg:text-5xl font-black text-gray-900">
                  Ce ne <span className="text-amber-600">definește</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Principiile care ne ghidează în fiecare proiect și ne ajută să oferim rezultate excepționale
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {values.map((value, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-8 text-center space-y-6">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-sm ${value.accent}`}>
                        {value.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center space-y-4 mb-12">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Expertiza Noastră
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900">
                  Domenii de <span className="text-green-600">specializare</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Echipa noastră de specialiști acoperă toate aspectele grădinăritului profesional
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {expertiseAreas.map((area, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`inline-flex p-3 rounded-xl ${area.color}`}>
                        {area.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {area.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {area.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 text-center">
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-left">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Echipa Flori și Frunze
                        </h3>
                        <p className="text-gray-600">
                          8 specialiști pasionați cu peste 15 ani de experiență combinată
                        </p>
                      </div>
                      <div className="flex gap-8">
                        <div className="text-center">
                          <div className="text-2xl font-black text-green-600">500+</div>
                          <div className="text-sm text-gray-600">Proiecte</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-blue-600">98%</div>
                          <div className="text-sm text-gray-600">Satisfacție</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-black text-purple-600">15+</div>
                          <div className="text-sm text-gray-600">Ani</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="space-y-6 mb-16">
                <Badge className="bg-white/20 text-white border-white/30">
                  Mărturii
                </Badge>
                <h2 className="text-3xl lg:text-5xl font-black">
                  Ce spun <span className="text-green-300">clienții</span>
                </h2>
              </div>

              <div className="space-y-8">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-8 lg:p-12">
                    <Quote className="h-12 w-12 text-green-300 mx-auto mb-6" />
                    <p className="text-xl lg:text-2xl leading-relaxed mb-8 text-white/95">
                      "{testimonials[activeTestimonial].quote}"
                    </p>
                    <div className="space-y-2">
                      <p className="font-bold text-lg text-green-300">
                        {testimonials[activeTestimonial].author}
                      </p>
                      <p className="text-white/70">
                        {testimonials[activeTestimonial].location}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === activeTestimonial 
                          ? 'bg-green-300 w-8' 
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl lg:text-5xl font-black text-gray-900">
                Să transformăm împreună
                <span className="block text-green-600">grădina ta</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Contactează-ne astăzi pentru o consultație gratuită și să discutăm despre visurile tale pentru spațiul verde
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link href="/contact">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl w-full sm:w-auto">
                    <Users className="mr-2 h-5 w-5" />
                    Programează Consultația
                  </Button>
                </Link>
                <Link href="/services">
                  <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-xl w-full sm:w-auto">
                    <Scissors className="mr-2 h-5 w-5" />
                    Vezi Serviciile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}