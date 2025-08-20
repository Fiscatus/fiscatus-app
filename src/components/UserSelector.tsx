import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";
import { useUser, mockUsers, type User as UserType } from "@/contexts/UserContext";

export default function UserSelector() {
  const { user, setUser } = useUser();

  const handleUserChange = (selectedUser: UserType) => {
    setUser(selectedUser);
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Simular Usuário (Para Teste de Permissões)
        </CardTitle>
        <p className="text-sm text-gray-600">
          Altere o usuário para testar as diferentes permissões por gerência
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockUsers.map((mockUser) => (
            <Button
              key={mockUser.id}
              variant={user?.id === mockUser.id ? "default" : "outline"}
              className={`
                p-4 h-auto text-left justify-start
                ${user?.id === mockUser.id 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'hover:bg-blue-50'
                }
              `}
              onClick={() => handleUserChange(mockUser)}
            >
              <div className="flex items-center gap-3 w-full">
                <User className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{mockUser.nome}</p>
                  <p className="text-xs opacity-75 truncate">{mockUser.cargo}</p>
                  <Badge 
                    variant="secondary" 
                    className={`
                      text-xs mt-1
                      ${user?.id === mockUser.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                      }
                    `}
                  >
                    {mockUser.gerencia}
                  </Badge>
                </div>
              </div>
            </Button>
          ))}
        </div>
        
        {user && (
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-600">
              <strong>Usuário ativo:</strong> {user.nome} - {user.gerencia}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 