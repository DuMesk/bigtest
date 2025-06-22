import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Check, Scissors, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const barbers = [
  {
    id: 1,
    name: 'PW Barber',
    image: 'https://imagizer.imageshack.com/v2/640x480q70/924/yoCw8H.jpg',
  },
  {
    id: 2,
    name: 'Nilde Santos',
    image: 'https://imagizer.imageshack.com/v2/640x480q70/923/Nh00KJ.jpg',
  },
  {
    id: 3,
    name: 'Regis Barber',
    image: 'https://imagizer.imageshack.com/v2/640x480q70/924/MV30EK.jpg',
  },
  {
    id: 4,
    name: 'Ruan C. Barber',
    image: 'https://imagizer.imageshack.com/v2/640x480q70/924/3390wD.jpg',
  },
];

const services = [
  { id: 1, name: 'Corte só máquina', price: 'R$ 18,00'},
  { id: 2, name: 'Corte só tesoura', price: 'R$ 35,00'},
  { id: 3, name: 'Corte degradê  "simples"', price: 'R$ 35,00'},
  { id: 4, name: 'Corte degradê navalhado', price: 'R$ 40,00'},
  { id: 5, name: 'Corte social', price: 'R$ 30,00'},
  { id: 6, name: 'Barba', price: 'R$ 25,00'},
  { id: 7, name: 'Sobrancelha navalha', price: 'R$ 15,00'},
  { id: 8, name: 'Sobrancelha pinça', price: 'R$ 20,00'},
  { id: 9, name: 'Sobrancelha feminina', price: 'R$ 20,00'},
  { id: 10, name: 'Listra simples', price: 'R$ 2,00'},
  { id: 11, name: 'Freestyle "a partir de"', price: 'R$ 5,00'},
  { id: 12, name: 'Pezinho', price: 'R$ 8,00'},
  { id: 13, name: 'Bigode', price: 'R$ 8,00'},
  { id: 14, name: 'Cavanhaque', price: 'R$ 15,00'},
  { id: 15, name: 'Barba express "toda na máquina"', price: 'R$ 15,00'},
  { id: 16, name: 'Finalização', price: 'R$ 15,00'},
  { id: 17, name: 'Pigmentação pezinho', price: 'R$ 10,00'},
  { id: 18, name: 'Pigmentação metade barba', price: 'R$ 12,00'},
  { id: 19, name: 'Pigmentação barba', price: 'R$ 20,00'},
  { id: 20, name: 'Pigmentação cabelo', price: 'R$ 30,00'},
  { id: 21, name: 'Pigmentação sobrancela', price: 'R$ 20,00'},
  { id: 22, name: 'Relaxamento', price: 'R$ 30,00'},
  { id: 23, name: 'Progressiva', price: 'R$ 35,00'},
  { id: 24, name: 'Luzes', price: 'R$ 100,00'},
  { id: 25, name: 'Platinado', price: 'R$ 100,00'},
];

const locations = [
  { id: 1, name: 'BIG MAN Barber Shopp', address: 'QR 117 Conjunto A , 03 - 72547401 Santa Maria - Brasília/DF' },
  
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
];

const AppointmentPage = () => {
  useEffect(() => {
    document.title = 'Agendar | BIG MAN Barber Shopp';
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const selectedServiceData = services.find(s => s.id === selectedService);
      const selectedBarberData = barbers.find(b => b.id === selectedBarber);
      const selectedLocationData = locations.find(l => l.id === selectedLocation);

      if (!selectedServiceData || !selectedBarberData || !selectedLocationData || !selectedDate || !selectedTime) {
        throw new Error('Missing required appointment information');
      }

      const appointmentData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceId: selectedService,
        serviceName: selectedServiceData.name,
        barberId: selectedBarber,
        barberName: selectedBarberData.name,
        locationId: selectedLocation,
        locationName: selectedLocationData.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-appointment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: appointmentData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      setIsComplete(true);
    } catch (err) {
      console.error('Appointment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleServiceSelect = (id: number) => {
    setSelectedService(id);
  };

  const handleBarberSelect = (id: number) => {
    setSelectedBarber(id);
  };

  const handleLocationSelect = (id: number) => {
    setSelectedLocation(id);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    const monthName = format(currentMonth, 'MMMM', { locale: ptBR });
    
    const calendar = [];
    const today = new Date();
    
    for (let i = 0; i < firstDay; i++) {
      calendar.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.setHours(0, 0, 0, 0));
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      calendar.push(
        <button
          key={`day-${day}`}
          onClick={() => handleDateSelect(date)}
          disabled={isPast}
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            isSelected 
              ? 'bg-accent text-white' 
              : isToday 
                ? 'bg-accent/20 text-accent' 
                : isPast 
                  ? 'text-slate-400 cursor-not-allowed' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg capitalize">{monthName} {year}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendar}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
        <img 
          src="https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260" 
          alt="Agendar" 
          className="absolute w-full h-full object-cover object-center"
        />
        <div className="container-custom relative z-20 text-white">
          <h1 className="heading-xl mb-6">Agende seu Horário</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            Marque seu horário de forma rápida e fácil. Escolha o serviço, o profissional e o dia que melhor se encaixa na sua agenda.
          </p>
        </div>
      </section>

      {/* Appointment Form */}
      <section className="section bg-white dark:bg-slate-800">
        <div className="container-custom">
          {!isComplete ? (
            <div className="max-w-3xl mx-auto">
              {/* Progress Steps */}
              <div className="flex justify-between mb-12">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        currentStep >= step 
                          ? 'bg-accent text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step}
                    </div>
                    <span 
                      className={`text-sm ${
                        currentStep >= step 
                          ? 'text-accent font-medium' 
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step === 1 ? 'Serviço' : 
                       step === 2 ? 'Profissional' : 
                       step === 3 ? 'Data e Hora' : 
                       'Confirmação'}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Step 1: Choose Service */}
              {currentStep === 1 && (
                <div>
                  <h2 className="heading-md mb-8">Escolha o Serviço</h2>
                  
                  <div className="space-y-4 mb-8">
                    {services.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => handleServiceSelect(service.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedService === service.id 
                            ? 'border-accent bg-accent/5' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-lg">{service.name}</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                              
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-accent">{service.price}</span>
                            <div 
                              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                selectedService === service.id 
                                  ? 'border-accent bg-accent text-white' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {selectedService === service.id && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      onClick={nextStep}
                      disabled={!selectedService}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Barber and Location */}
              {currentStep === 2 && (
                <div>
                  <h2 className="heading-md mb-8">Escolha o Profissional e a Unidade</h2>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Profissional</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {barbers.map((barber) => (
                        <div 
                          key={barber.id}
                          onClick={() => handleBarberSelect(barber.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-4 ${
                            selectedBarber === barber.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                          }`}
                        >
                          <img 
                            src={barber.image}
                            alt={barber.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{barber.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {barber.position}
                            </p>
                          </div>
                          <div 
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                              selectedBarber === barber.id 
                                ? 'border-accent bg-accent text-white' 
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {selectedBarber === barber.id && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Unidade</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {locations.map((location) => (
                        <div 
                          key={location.id}
                          onClick={() => handleLocationSelect(location.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedLocation === location.id 
                              ? 'border-accent bg-accent/5' 
                              : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{location.name}</h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {location.address}
                              </p>
                            </div>
                            <div 
                              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                                selectedLocation === location.id 
                                  ? 'border-accent bg-accent text-white' 
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {selectedLocation === location.id && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="btn btn-outline"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={!selectedBarber || !selectedLocation}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Choose Date and Time */}
              {currentStep === 3 && (
                <div>
                  <h2 className="heading-md mb-8">Escolha a Data e Horário</h2>
                  
                  <div className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Data</h3>
                    {renderCalendar()}
                  </div>
                  
                  {selectedDate && (
                    <div className="mb-8">
                      <h3 className="font-bold text-lg mb-4">Horário</h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className={`p-2 border rounded text-center ${
                              selectedTime === time 
                                ? 'border-accent bg-accent text-white' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-accent'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <button 
                      onClick={prevStep}
                      className="btn btn-outline"
                    >
                      Voltar
                    </button>
                    <button 
                      onClick={nextStep}
                      disabled={!selectedDate || !selectedTime}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <div>
                  <h2 className="heading-md mb-8">Confirme seu Agendamento</h2>
                  
                  <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-8">
                    <h3 className="font-bold text-lg mb-4">Resumo do Agendamento</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Scissors className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Serviço</p>
                          <p className="font-medium">
                            {services.find(s => s.id === selectedService)?.name}
                            {' - '}
                            {services.find(s => s.id === selectedService)?.price}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Profissional</p>
                          <p className="font-medium">
                            {barbers.find(b => b.id === selectedBarber)?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Data e Hora</p>
                          <p className="font-medium">
                            {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Unidade</p>
                          <p className="font-medium">
                            {locations.find(l => l.id === selectedLocation)?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="mb-8">
                    <h3 className="font-bold text-lg mb-4">Seus Dados</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                          Nome completo
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                          Telefone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                          E-mail
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-8">
                      <button 
                        type="button"
                        onClick={prevStep}
                        className="btn btn-outline"
                      >
                        Voltar
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting || !formData.name || !formData.phone || !formData.email}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="heading-lg mb-4">Agendamento Realizado!</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                Seu horário foi marcado com sucesso. Você receberá uma confirmação por e-mail e WhatsApp.
              </p>
              <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg mb-8 max-w-md mx-auto">
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <Scissors className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Serviço</p>
                      <p className="font-medium">
                        {services.find(s => s.id === selectedService)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Profissional</p>
                      <p className="font-medium">
                        {barbers.find(b => b.id === selectedBarber)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Data e Hora</p>
                      <p className="font-medium">
                        {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Unidade</p>
                      <p className="font-medium">
                        {locations.find(l => l.id === selectedLocation)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AppointmentPage;
