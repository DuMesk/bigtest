import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Calendar, Clock, MapPin, User, Phone, LogOut, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminStore, useProductStore } from '../../lib/store';
import { useNavigate } from 'react-router-dom';
import { ProductManagement } from '../../components/admin/ProductManagement';

interface Appointment {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  service_id: number;
  barber_id: number;
  appointment_date: string;
  appointment_time: string;
  location_id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, checkAdminStatus } = useAdminStore();
  const { fetchProducts } = useProductStore();
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [activeTab, setActiveTab] = useState('appointments');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
      fetchProducts();
    }
  }, [isAdmin, fetchProducts]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const updateAppointmentDateTime = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime
        })
        .eq('id', id);

      if (error) throw error;
      setEditingAppointment(null);
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container-custom">
          <div className="text-center">
            <h1 className="heading-lg text-error mb-4">Acesso Negado</h1>
            <p className="text-slate-600 dark:text-white">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pt-20 lg:pt-16 gap-4">
          <h1 className="heading-lg dark:text-white">Painel Administrativo</h1>
          <button 
            onClick={handleLogout}
            className="btn btn-outline flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-8 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap ${
              activeTab === 'appointments' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-accent'
            }`}
          >
            Agendamentos
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-medium text-lg whitespace-nowrap flex items-center space-x-2 ${
              activeTab === 'products' 
                ? 'border-b-2 border-accent text-accent' 
                : 'text-slate-500 dark:text-slate-400 hover:text-accent'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Produtos</span>
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <p className="dark:text-white">Carregando...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                  <div key={status} className="card p-6">
                    <h2 className="heading-md mb-6 capitalize dark:text-white">
                      {status === 'pending' && 'Agendamentos Pendentes'}
                      {status === 'confirmed' && 'Agendamentos Confirmados'}
                      {status === 'completed' && 'Agendamentos Concluídos'}
                      {status === 'cancelled' && 'Agendamentos Cancelados'}
                    </h2>

                    <div className="space-y-4">
                      {appointments
                        .filter((appointment) => appointment.status === status)
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6"
                          >
                            <div className="flex flex-wrap gap-6 mb-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Cliente</p>
                                  <p className="font-medium dark:text-white">{appointment.user_name}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Telefone</p>
                                  <p className="font-medium dark:text-white">{appointment.user_phone}</p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Data</p>
                                  <p className="font-medium dark:text-white">
                                    {format(new Date(appointment.appointment_date), "dd 'de' MMMM", {
                                      locale: ptBR,
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-accent" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-300">Horário</p>
                                  <p className="font-medium dark:text-white">{appointment.appointment_time}</p>
                                </div>
                              </div>
                            </div>

                            {editingAppointment === appointment.id ? (
                              <div className="mb-4 space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-white">Nova Data</label>
                                  <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 dark:text-white">Novo Horário</label>
                                  <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full border rounded p-2 dark:bg-slate-600 dark:text-white dark:border-slate-500"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => updateAppointmentDateTime(appointment.id)}
                                    className="btn btn-primary py-2"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingAppointment(null)}
                                    className="btn btn-outline py-2"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                                      className="btn btn-primary py-2"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Confirmar
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                      className="btn btn-outline py-2 text-error border-error hover:bg-error/10"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingAppointment(appointment.id);
                                        setNewDate(appointment.appointment_date);
                                        setNewTime(appointment.appointment_time);
                                      }}
                                      className="btn btn-outline py-2"
                                    >
                                      Alterar Horário
                                    </button>
                                  </>
                                )}

                                {status === 'confirmed' && (
                                  <>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                      className="btn btn-primary py-2"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Marcar como Concluído
                                    </button>
                                    <button
                                      onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                      className="btn btn-outline py-2 text-error border-error hover:bg-error/10"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingAppointment(appointment.id);
                                        setNewDate(appointment.appointment_date);
                                        setNewTime(appointment.appointment_time);
                                      }}
                                      className="btn btn-outline py-2"
                                    >
                                      Alterar Horário
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                      {appointments.filter((appointment) => appointment.status === status).length === 0 && (
                        <p className="text-center text-slate-500 dark:text-white py-4">
                          Nenhum agendamento {status === 'pending' && 'pendente'}
                          {status === 'confirmed' && 'confirmado'}
                          {status === 'completed' && 'concluído'}
                          {status === 'cancelled' && 'cancelado'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && <ProductManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;