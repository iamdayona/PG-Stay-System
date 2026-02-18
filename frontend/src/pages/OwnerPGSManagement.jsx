import React from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import RoleNavigation from "../context/RoleNavigation";

const PGManagement = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="owner" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">
          PG and Room Management
        </h2>

        {/* PG Details Form */}
        <Card className="p-6 bg-white border border-gray-300 mb-6">
          <h3 className="text-lg mb-6 text-gray-800">PG Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>PG Name</Label>
              <Input placeholder="Enter PG name" />
            </div>

            <div>
              <Label>Location</Label>
              <Input placeholder="Enter location" />
            </div>

            <div>
              <Label>Rent (per month)</Label>
              <Input type="number" placeholder="Enter rent" />
            </div>

            <div>
              <Label>Amenities</Label>
              <Input placeholder="WiFi, AC, Meals, etc." />
            </div>
          </div>

          <Button className="mt-6">
            Save PG Details
          </Button>
        </Card>

        {/* Room Management */}
        <Card className="p-6 bg-white border border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-gray-800">Room Management</h3>

            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Room
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "Single Room", available: true },
              { type: "Double Room", available: true },
              { type: "Triple Room", available: false },
              { type: "Single AC Room", available: true },
              { type: "Double AC Room", available: false },
              { type: "Triple AC Room", available: true },
            ].map((room, index) => (
              <Card
                key={index}
                className="p-4 bg-gray-50 border border-gray-300"
              >
                <p className="text-gray-800 mb-3">{room.type}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Available</span>
                  <Switch defaultChecked={room.available} />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OwnerPGManagement;