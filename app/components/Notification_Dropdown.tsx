// File: components/Notification_Dropdown.tsx
"use client";
import type { ComponentType } from "react";
import {
  WalletIcon,
  RepairsIcon,
  GiftIcon,
  CardIcon,
  UserCheckIcon,
  type KlinIconProps,
} from "./icons/KlinIcons";

interface NotificationItemProps {
  icon: ComponentType<KlinIconProps>;
  bgColor: string;
  title: string;
  description: string;
}

interface NotificationSection {
  items: NotificationItemProps[];
  title: string;
  date?: string;
}

interface NotificationDropdownProps {
  isNotificationOpen: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  icon: Icon,
  bgColor,
  title,
  description,
}) => (
  <div className="flex items-start p-4 bg-gray-50 rounded-lg mb-3">
    <div
      className={`flex items-center justify-center shrink-0 ${bgColor} w-12 h-12 rounded-2xl mr-3`}
    >
      <Icon size={28} />
    </div>
    <div>
      <p className="font-bold text-black">{title}</p>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  </div>
);

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isNotificationOpen,
}) => {
  const todayItems: NotificationItemProps[] = [
    {
      icon: WalletIcon,
      bgColor: "bg-brand-100",
      title: "Payment Successful!",
      description: "You have made a services payment",
    },
    {
      icon: RepairsIcon,
      bgColor: "bg-rose-50",
      title: "New Category Services!",
      description: "Now the plumbing services is available",
    },
  ];

  const yesterdayItems: NotificationItemProps[] = [
    {
      icon: GiftIcon,
      bgColor: "bg-pink-50",
      title: "Today's Special Offers",
      description: "You get a special promo today!",
    },
  ];

  const pastItems: NotificationItemProps[] = [
    {
      icon: CardIcon,
      bgColor: "bg-brand-100",
      title: "Credit Card Connected!",
      description: "Credit Card has been linked!",
    },
    {
      icon: UserCheckIcon,
      bgColor: "bg-green-50",
      title: "Account Setup Successful!",
      description: "Your account has been created!",
    },
  ];

  const notificationsData: NotificationSection[] = [
    { title: "Today", items: todayItems },
    { title: "Yesterday", items: yesterdayItems },
    {
      title: "September 12, 2023",
      items: pastItems,
      date: "September 12, 2023",
    },
  ];

  return (
    <>
      {isNotificationOpen && (
        <div className="px-4 pb-6 max-h-[50vh] overflow-y-auto absolute z-50 top-16 right-4  bg-white w-80 shadow-lg rounded-lg ">
          {notificationsData.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-xl mb-3 mt-2">{section.title}</h3>
              {section.items.map((item, itemIndex) => (
                <NotificationItem
                  key={`${index}-${itemIndex}`}
                  icon={item.icon}
                  bgColor={item.bgColor}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;
