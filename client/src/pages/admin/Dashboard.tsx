import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layouts/AdminLayout";

export default function AdminDashboard() {
  // Fetch data
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    refetchOnWindowFocus: false,
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/admin/appointments'],
    refetchOnWindowFocus: false,
  });

  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery({
    queryKey: ['/api/admin/inquiries'],
    refetchOnWindowFocus: false,
  });

  // Count data
  const services = servicesData?.services || [];
  const appointments = appointmentsData?.appointments || [];
  const inquiries = inquiriesData?.inquiries || [];

  // Recent data
  const recentAppointments = [...appointments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  const recentInquiries = [...inquiries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const isLoading = servicesLoading || appointmentsLoading || inquiriesLoading;

  return (
    <AdminLayout 
      title="Flori si Frunze Dashboard" 
      description="Welcome to the admin dashboard"
      action={
        <Link href="/admin/services">
          <Button className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-plus mr-2"></i> Add Service
          </Button>
        </Link>
      }
    >
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{services.length}</p>
              <div className="ml-2 flex items-center text-green-600 text-xs font-medium">
                <i className="fas fa-leaf mr-1"></i> 
                <span>Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{appointments.length}</p>
              <div className="ml-2 flex items-center text-yellow-600 text-xs font-medium">
                <i className="fas fa-clock mr-1"></i> 
                <span>Upcoming</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">New Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{inquiries.filter(i => i.status === 'new').length}</p>
              <div className="ml-2 flex items-center text-blue-600 text-xs font-medium">
                <i className="fas fa-envelope mr-1"></i> 
                <span>Unread</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === 'completed').length}</p>
              <div className="ml-2 flex items-center text-green-600 text-xs font-medium">
                <i className="fas fa-check-circle mr-1"></i> 
                <span>Done</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Latest scheduled services</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">
                <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="mr-4 mt-1">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                        <i className="fas fa-calendar-alt"></i>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} - {services.find(s => s.id === appointment.serviceId)?.name || 'Service'}
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm font-medium text-blue-600">
                      <Link href={`/admin/appointments`}>
                        <a>View</a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No recent appointments
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/admin/appointments">
                <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  View all appointments →
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>Latest customer messages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">
                <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : recentInquiries.length > 0 ? (
              <div className="space-y-4">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="mr-4 mt-1">
                      <span className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        inquiry.status === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <i className="fas fa-envelope"></i>
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {inquiry.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {inquiry.message.substring(0, 50)}...
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm font-medium text-blue-600">
                      <Link href={`/admin/inquiries`}>
                        <a>View</a>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No recent inquiries
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/admin/inquiries">
                <a className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  View all inquiries →
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}